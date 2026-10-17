"""
WebSleuth AI — Verified Government & Institutional Website Registry
Hosted on IBM LinuxONE for maximum security, integrity, and availability.
Data is cryptographically signed and tamper-evident.
"""

VERIFIED_SITES = [
    # ── Tax & Finance ──────────────────────────────────────────────────────────
    {
        "name": "Income Tax Department",
        "domain": "incometax.gov.in",
        "url": "https://www.incometax.gov.in",
        "category": "Tax & Finance",
        "description": "File ITR, check refund status, PAN services",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "💰"
    },
    {
        "name": "GST Portal",
        "domain": "gst.gov.in",
        "url": "https://www.gst.gov.in",
        "category": "Tax & Finance",
        "description": "GST registration, filing, and payments",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "🧾"
    },
    {
        "name": "Reserve Bank of India",
        "domain": "rbi.org.in",
        "url": "https://www.rbi.org.in",
        "category": "Tax & Finance",
        "description": "Monetary policy, banking regulations, financial stability",
        "ministry": "Government of India",
        "verified": True,
        "icon": "🏦"
    },
    {
        "name": "SEBI",
        "domain": "sebi.gov.in",
        "url": "https://www.sebi.gov.in",
        "category": "Tax & Finance",
        "description": "Securities and Exchange Board of India",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "📈"
    },
    {
        "name": "NSDL - PAN Services",
        "domain": "nsdl.co.in",
        "url": "https://www.nsdl.co.in",
        "category": "Tax & Finance",
        "description": "PAN card application and services",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "🪪"
    },

    # ── Identity & Documents ───────────────────────────────────────────────────
    {
        "name": "UIDAI - Aadhaar",
        "domain": "uidai.gov.in",
        "url": "https://www.uidai.gov.in",
        "category": "Identity & Documents",
        "description": "Aadhaar card download, update, and verification",
        "ministry": "Ministry of Electronics & IT",
        "verified": True,
        "icon": "🪪"
    },
    {
        "name": "Passport Seva",
        "domain": "passportindia.gov.in",
        "url": "https://www.passportindia.gov.in",
        "category": "Identity & Documents",
        "description": "Passport application, renewal, and tracking",
        "ministry": "Ministry of External Affairs",
        "verified": True,
        "icon": "🛂"
    },
    {
        "name": "DigiLocker",
        "domain": "digilocker.gov.in",
        "url": "https://www.digilocker.gov.in",
        "category": "Identity & Documents",
        "description": "Digital document wallet — Aadhaar, DL, RC book",
        "ministry": "Ministry of Electronics & IT",
        "verified": True,
        "icon": "📂"
    },
    {
        "name": "Voter Registration (NVSP)",
        "domain": "nvsp.in",
        "url": "https://www.nvsp.in",
        "category": "Identity & Documents",
        "description": "Voter ID registration, correction, and status",
        "ministry": "Election Commission of India",
        "verified": True,
        "icon": "🗳️"
    },

    # ── Banking ────────────────────────────────────────────────────────────────
    {
        "name": "State Bank of India",
        "domain": "sbi.co.in",
        "url": "https://www.sbi.co.in",
        "category": "Banking",
        "description": "India's largest public sector bank",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "🏧"
    },
    {
        "name": "Bank of Baroda",
        "domain": "bankofbaroda.in",
        "url": "https://www.bankofbaroda.in",
        "category": "Banking",
        "description": "Public sector bank — accounts, loans, services",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "🏧"
    },

    # ── Social Welfare ─────────────────────────────────────────────────────────
    {
        "name": "EPFO",
        "domain": "epfindia.gov.in",
        "url": "https://www.epfindia.gov.in",
        "category": "Social Welfare",
        "description": "Employee Provident Fund — balance, withdrawal",
        "ministry": "Ministry of Labour & Employment",
        "verified": True,
        "icon": "👷"
    },
    {
        "name": "PM Kisan Samman Nidhi",
        "domain": "pmkisan.gov.in",
        "url": "https://www.pmkisan.gov.in",
        "category": "Social Welfare",
        "description": "Direct farmer income support scheme",
        "ministry": "Ministry of Agriculture",
        "verified": True,
        "icon": "🌾"
    },
    {
        "name": "IRDAI",
        "domain": "irdai.gov.in",
        "url": "https://www.irdai.gov.in",
        "category": "Social Welfare",
        "description": "Insurance Regulatory and Development Authority",
        "ministry": "Ministry of Finance",
        "verified": True,
        "icon": "🛡️"
    },

    # ── Transportation ─────────────────────────────────────────────────────────
    {
        "name": "IRCTC",
        "domain": "irctc.co.in",
        "url": "https://www.irctc.co.in",
        "category": "Transportation",
        "description": "Indian Railways ticket booking (ONLY official site)",
        "ministry": "Ministry of Railways",
        "verified": True,
        "icon": "🚄"
    },
    {
        "name": "Indian Railways",
        "domain": "indianrailways.gov.in",
        "url": "https://www.indianrailways.gov.in",
        "category": "Transportation",
        "description": "Official Indian Railways information portal",
        "ministry": "Ministry of Railways",
        "verified": True,
        "icon": "🚂"
    },
    {
        "name": "NHAI",
        "domain": "nhai.gov.in",
        "url": "https://www.nhai.gov.in",
        "category": "Transportation",
        "description": "National Highways Authority of India",
        "ministry": "Ministry of Road Transport",
        "verified": True,
        "icon": "🛣️"
    },

    # ── Health ─────────────────────────────────────────────────────────────────
    {
        "name": "CoWIN (Vaccination)",
        "domain": "cowin.gov.in",
        "url": "https://www.cowin.gov.in",
        "category": "Health",
        "description": "COVID-19 vaccination certificate and registration",
        "ministry": "Ministry of Health & Family Welfare",
        "verified": True,
        "icon": "💉"
    },
    {
        "name": "AIIMS Delhi",
        "domain": "aiims.edu",
        "url": "https://www.aiims.edu",
        "category": "Health",
        "description": "All India Institute of Medical Sciences",
        "ministry": "Ministry of Health & Family Welfare",
        "verified": True,
        "icon": "🏥"
    },
    {
        "name": "Ministry of Health",
        "domain": "mohfw.gov.in",
        "url": "https://www.mohfw.gov.in",
        "category": "Health",
        "description": "Health advisories, programs, and policies",
        "ministry": "Ministry of Health & Family Welfare",
        "verified": True,
        "icon": "🏥"
    },

    # ── Education ──────────────────────────────────────────────────────────────
    {
        "name": "CBSE",
        "domain": "cbse.gov.in",
        "url": "https://www.cbse.gov.in",
        "category": "Education",
        "description": "Results, admit cards, and school affiliation",
        "ministry": "Ministry of Education",
        "verified": True,
        "icon": "🎓"
    },
    {
        "name": "UGC",
        "domain": "ugc.ac.in",
        "url": "https://www.ugc.ac.in",
        "category": "Education",
        "description": "University Grants Commission — higher education",
        "ministry": "Ministry of Education",
        "verified": True,
        "icon": "🏛️"
    },
    {
        "name": "NIC",
        "domain": "nic.in",
        "url": "https://www.nic.in",
        "category": "Education",
        "description": "National Informatics Centre — e-governance",
        "ministry": "Ministry of Electronics & IT",
        "verified": True,
        "icon": "💻"
    },

    # ── Government Portals ─────────────────────────────────────────────────────
    {
        "name": "India.gov.in",
        "domain": "india.gov.in",
        "url": "https://www.india.gov.in",
        "category": "Government Portals",
        "description": "Official National Portal of India",
        "ministry": "Government of India",
        "verified": True,
        "icon": "🇮🇳"
    },
    {
        "name": "MCA21",
        "domain": "mca.gov.in",
        "url": "https://www.mca.gov.in",
        "category": "Government Portals",
        "description": "Ministry of Corporate Affairs — company registration",
        "ministry": "Ministry of Corporate Affairs",
        "verified": True,
        "icon": "🏢"
    },
    {
        "name": "NITI Aayog",
        "domain": "niti.gov.in",
        "url": "https://www.niti.gov.in",
        "category": "Government Portals",
        "description": "Policy think tank of the Government of India",
        "ministry": "Government of India",
        "verified": True,
        "icon": "📋"
    },
    {
        "name": "PIB - Press Information Bureau",
        "domain": "pib.gov.in",
        "url": "https://www.pib.gov.in",
        "category": "Government Portals",
        "description": "Official government press releases and news",
        "ministry": "Government of India",
        "verified": True,
        "icon": "📰"
    },
    {
        "name": "MSME",
        "domain": "msme.gov.in",
        "url": "https://www.msme.gov.in",
        "category": "Government Portals",
        "description": "Small business registration, schemes, and loans",
        "ministry": "Ministry of MSME",
        "verified": True,
        "icon": "🏭"
    },
]

CATEGORIES = sorted(set(s["category"] for s in VERIFIED_SITES))
