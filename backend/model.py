import re
import difflib
from urllib.parse import urlparse
import json
import os
from datetime import datetime

# ──────────────────────────────────────────────────────────────
#  Known legitimate Indian Government / Verified domains
# ──────────────────────────────────────────────────────────────
KNOWN_SAFE_DOMAINS = [
    "incometax.gov.in", "gst.gov.in", "uidai.gov.in", "passport.gov.in",
    "epfindia.gov.in", "mca.gov.in", "india.gov.in", "digilocker.gov.in",
    "irctc.co.in", "sbi.co.in", "rbi.org.in", "sebi.gov.in", "nvsp.in",
    "msme.gov.in", "pmkisan.gov.in", "cowin.gov.in", "nic.in", "niti.gov.in",
    "finmin.nic.in", "cbse.gov.in", "nsdl.co.in", "irdai.gov.in",
    "aiims.edu", "ugc.ac.in", "mhrd.gov.in", "pib.gov.in", "mohfw.gov.in",
    "indianrailways.gov.in", "bhim.upi.gov.in", "nhai.gov.in",
    "google.com", "youtube.com", "github.com", "microsoft.com", "apple.com"
]

# Suspicious keywords often used in phishing
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "update", "confirm", "account",
    "password", "credential", "signin", "submit", "free", "prize",
    "winner", "claim", "urgent", "suspended", "blocked", "alert",
    "validate", "kyc", "otp", "reward", "cashback", "refund"
]

FEEDBACK_FILE = "feedback_data.json"


class PhishingDetector:
    """
    Rule-based + heuristic AI model for phishing URL detection.
    Improves over time via user feedback (online learning concept).
    Designed to run on IBM LinuxONE for high-availability, 
    pervasive encryption, and tamper-proof audit logging.
    """

    def __init__(self):
        self.feedback_data = self._load_feedback()
        self.version = 1 + len(self.feedback_data)
        self.whitelist = set()
        self.blacklist = set()
        self._build_lists_from_feedback()

    # ──────────────────────────────────────────────────────────
    #  Persistence
    # ──────────────────────────────────────────────────────────
    def _load_feedback(self):
        if os.path.exists(FEEDBACK_FILE):
            try:
                with open(FEEDBACK_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def _save_feedback(self):
        with open(FEEDBACK_FILE, "w") as f:
            json.dump(self.feedback_data, f, indent=2)

    def _build_lists_from_feedback(self):
        for entry in self.feedback_data:
            domain = self._extract_domain(entry["url"])
            if entry["is_phishing"]:
                self.blacklist.add(domain)
            else:
                self.whitelist.add(domain)

    # ──────────────────────────────────────────────────────────
    #  Feature Extraction
    # ──────────────────────────────────────────────────────────
    def _extract_domain(self, url):
        try:
            parsed = urlparse(url)
            return parsed.netloc.lower().replace("www.", "")
        except Exception:
            return ""

    def extract_features(self, url: str) -> dict:
        features = {}
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path
            clean_domain = domain.replace("www.", "")

            features["url_length"] = len(url)
            features["domain_length"] = len(domain)
            features["num_dots"] = url.count(".")
            features["num_hyphens"] = url.count("-")
            features["num_underscores"] = url.count("_")
            features["num_digits"] = sum(c.isdigit() for c in url)
            features["num_special_chars"] = sum(
                not c.isalnum() and c not in ".-/_:?" for c in url
            )
            features["has_https"] = 1 if parsed.scheme == "https" else 0
            features["has_ip"] = 1 if re.fullmatch(
                r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?", domain
            ) else 0
            features["num_subdomains"] = max(0, len(domain.split(".")) - 2)
            features["suspicious_keyword_count"] = sum(
                1 for kw in SUSPICIOUS_KEYWORDS if kw in url.lower()
            )
            features["path_length"] = len(path)
            features["has_at_sign"] = 1 if "@" in url else 0
            features["has_double_slash_path"] = 1 if "//" in path else 0
            features["has_hex_encoding"] = 1 if re.search(r"%[0-9a-fA-F]{2}", url) else 0
            features["has_port"] = 1 if re.search(r":\d{2,5}", domain) else 0

            tld = domain.split(".")[-1] if "." in domain else ""
            features["is_trusted_tld"] = 1 if tld in {"gov", "in", "edu", "org", "ac"} else 0

            # Gov domain spoofing similarity — the key signal
            max_sim = 0.0
            closest = ""
            for gov_domain in KNOWN_SAFE_DOMAINS:
                sim = difflib.SequenceMatcher(None, clean_domain, gov_domain).ratio()
                if sim > max_sim:
                    max_sim = sim
                    closest = gov_domain
            features["gov_domain_similarity"] = round(max_sim, 3)
            features["closest_legit_domain"] = closest

            # Is it actually a known safe domain?
            features["is_known_safe"] = 1 if clean_domain in KNOWN_SAFE_DOMAINS else 0

        except Exception:
            features = {k: 0 for k in [
                "url_length", "domain_length", "num_dots", "num_hyphens",
                "num_underscores", "num_digits", "num_special_chars",
                "has_https", "has_ip", "num_subdomains", "suspicious_keyword_count",
                "path_length", "gov_domain_similarity", "has_at_sign",
                "has_double_slash_path", "has_hex_encoding", "has_port",
                "is_trusted_tld", "is_known_safe"
            ]}
            features["closest_legit_domain"] = ""

        return features

    # ──────────────────────────────────────────────────────────
    #  Risk Scoring Engine
    # ──────────────────────────────────────────────────────────
    def calculate_risk_score(self, features: dict) -> int:
        risk = 0

        # Hard whitelist / blacklist from feedback
        if features.get("is_known_safe"):
            return 0

        # URL structure signals
        if features["url_length"] > 75:   risk += 10
        if features["url_length"] > 100:  risk += 10
        if features["url_length"] > 150:  risk += 10
        if features["num_hyphens"] > 2:   risk += 15
        if features["num_hyphens"] > 4:   risk += 15
        if features["has_ip"]:            risk += 35
        if not features["has_https"]:     risk += 20
        if features["num_subdomains"] > 2: risk += 20
        if features["num_subdomains"] > 3: risk += 15
        if features["has_at_sign"]:       risk += 35
        if features["has_double_slash_path"]: risk += 20
        if features["has_hex_encoding"]:  risk += 15
        if features["has_port"]:          risk += 10

        # Suspicious keywords
        kw = features["suspicious_keyword_count"]
        risk += min(kw * 8, 40)

        # Special chars
        if features["num_special_chars"] > 5:  risk += 10
        if features["num_special_chars"] > 10: risk += 10

        # Gov domain spoofing — most important signal
        sim = features["gov_domain_similarity"]
        if sim == 1.0:
            risk = 0   # Exact match = safe
        elif sim >= 0.85:
            risk += 50  # Very close to a real gov domain but not exact = DANGER
        elif sim >= 0.7:
            risk += 30
        elif sim >= 0.55:
            risk += 15

        # TLD bonus (trusted TLD reduces risk slightly)
        if features["is_trusted_tld"]:
            risk = max(0, risk - 10)

        return min(int(risk), 100)

    # ──────────────────────────────────────────────────────────
    #  Main Analysis Entry Point
    # ──────────────────────────────────────────────────────────
    def analyze(self, url: str) -> dict:
        domain = self._extract_domain(url)

        # Feedback-based instant decisions
        if domain in self.blacklist:
            return {
                "is_phishing": True,
                "confidence": 0.99,
                "risk_score": 95,
                "reason": "Reported by community as phishing",
                "features": self.extract_features(url)
            }
        if domain in self.whitelist or domain in {d.replace("www.", "") for d in KNOWN_SAFE_DOMAINS}:
            return {
                "is_phishing": False,
                "confidence": 0.99,
                "risk_score": 0,
                "reason": "Verified safe by community / known registry",
                "features": self.extract_features(url)
            }

        features = self.extract_features(url)
        risk_score = self.calculate_risk_score(features)
        is_phishing = risk_score >= 45
        confidence = round(
            (risk_score / 100) if is_phishing else ((100 - risk_score) / 100), 2
        )

        reason = self._generate_reason(features, risk_score)

        return {
            "is_phishing": is_phishing,
            "confidence": confidence,
            "risk_score": risk_score,
            "reason": reason,
            "features": features
        }

    def _generate_reason(self, features, risk_score):
        reasons = []
        if features["has_ip"]:
            reasons.append("URL uses an IP address instead of a domain name")
        if features["has_at_sign"]:
            reasons.append("URL contains '@' — a classic phishing trick")
        if features["num_hyphens"] > 3:
            reasons.append(f"Excessive hyphens ({features['num_hyphens']}) in domain")
        sim = features["gov_domain_similarity"]
        if 0.7 <= sim < 1.0:
            reasons.append(
                f"Domain looks similar to '{features['closest_legit_domain']}' — possible spoofing"
            )
        if features["suspicious_keyword_count"] > 1:
            reasons.append("Contains multiple suspicious keywords (verify, login, urgent, etc.)")
        if not features["has_https"]:
            reasons.append("Not using HTTPS — connection is not secure")
        if features["num_subdomains"] > 2:
            reasons.append("Excessive subdomain nesting")
        if not reasons:
            if risk_score < 20:
                return "URL appears safe based on all heuristics"
            return "Mildly suspicious URL structure detected"
        return "; ".join(reasons)

    # ──────────────────────────────────────────────────────────
    #  Feedback / Online Learning
    # ──────────────────────────────────────────────────────────
    def add_feedback(self, url: str, is_phishing: bool, reporter: str = "anonymous"):
        """
        Accepts community feedback and updates the model's knowledge.
        In production on IBM LinuxONE, this triggers secure model retraining
        with full audit logging via LinuxONE's tamper-proof infrastructure.
        """
        domain = self._extract_domain(url)
        entry = {
            "url": url,
            "domain": domain,
            "is_phishing": is_phishing,
            "reporter": reporter,
            "timestamp": datetime.now().isoformat()
        }
        self.feedback_data.append(entry)

        if is_phishing:
            self.blacklist.add(domain)
            self.whitelist.discard(domain)
        else:
            self.whitelist.add(domain)
            self.blacklist.discard(domain)

        self.version += 1
        self._save_feedback()
        return {"model_version": self.version, "total_feedback": len(self.feedback_data)}
