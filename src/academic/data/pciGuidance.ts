// X1 review guidance by PCI DSS v4.0.1 requirement objective. Use each
// subrequirement's published applicability and procedure for formal testing.
export const pciGuidance = [
  [
    "Interview the accountable owner and review how network security rules and procedures are approved and communicated.",
    "Follow a sampled firewall rule from its business need through placement, change approval, review and protected configuration.",
    "Compare the connections permitted into and out of the cardholder data environment with the current data-flow and network diagrams.",
    "Walk an external connection across the trust boundary and examine the controls that stop unauthorised traffic and disclosure.",
    "Identify devices that reach both the payment environment and untrusted networks. Sample protection, running settings and exceptions.",
  ], [
    "Review how hardening procedures and owner responsibilities are communicated and kept current.",
    "Compare sampled system settings with approved baselines, including default accounts, required services and administrative access.",
    "Inventory wireless connections near or within the payment environment and check their approved safeguards and access.",
  ], [
    "Check ownership and the operating procedures for protecting stored account data.",
    "Reconcile discovery results with business and legal retention needs and check the deletion process.",
    "Trace sensitive authentication data before and after authorisation and verify whether any issuer-specific provision applies.",
    "Review displayed or copied account numbers, including approvals and the business need for unmasked access.",
    "Examine stored primary account number protection and the actual technologies used by payment systems.",
    "Identify cryptographic keys and sample their protection, access and separation from the data.",
    "Follow a key through generation, distribution, storage, rotation, retirement and response to suspected compromise.",
  ], [
    "Review procedures, roles and approvals for protecting account-data transmissions.",
    "Trace a sampled account-data transfer across an open network or messaging channel and examine active protections.",
  ], [
    "Review responsibilities and procedures for malware protection across the scoped environment.",
    "Review supported assets, tools and documented findings for components the entity considers outside malware-tool applicability.",
    "Inspect malware protection settings, updates, alert handling and approvals for exceptions.",
    "Review protections against phishing and check how the responsible team responds to a reported attempt.",
  ], [
    "Trace secure development procedure ownership from request intake through release.",
    "Sample security design, training, review and testing for bespoke or custom software.",
    "Follow a vulnerability notice through evaluation, prioritisation, correction and closure evidence.",
    "Review safeguards on public-facing applications and, where relevant, payment-page script governance.",
    "Trace a scoped change from approval through testing, deployment, separation and restoration arrangements.",
  ], [
    "Check ownership and current documentation for the business-need access programme.",
    "Compare a sample of roles and grants with authorisation, least privilege and review records.",
    "Verify how configured access controls enforce approved grants and deny access by default where required.",
  ], [
    "Review the procedures and responsibilities for identification and authentication.",
    "Trace user identities and accounts from approval to removal, including how shared or vendor access is controlled.",
    "Examine the factors used to authenticate users and sample issuance, management, verification and recovery.",
    "Enumerate administrative, remote and environment access paths. Compare each with the relevant MFA provision.",
    "Observe relevant MFA configuration and check that the required factors and protections apply in practice.",
    "Inventory application and system accounts. Review restrictions on interactive use and credential management.",
  ], [
    "Review responsibility and procedures for physical protection of account data locations and media.",
    "Walk physical entry points and inspect controls for the relevant facilities and equipment.",
    "Sample personnel and visitor authorisation, identification, escort and access revocation.",
    "Trace account data on physical or electronic media through access, inventory, transport and destruction.",
    "Scope devices used for card-present transactions and inspect tamper controls, inspection plan and reporting.",
  ], [
    "Review logging procedures, ownership and coverage across scoped systems.",
    "Check which events are captured and verify event attributes in actual sample records.",
    "Review who can read or modify log files and sample controls against unauthorised alteration or access.",
    "Follow logs from collection through review, handling exceptions and recorded follow-up.",
    "Retrieve historical logs and verify retention and availability to analysts.",
    "Compare component clocks and review the management of time sources and settings.",
    "Trace a failure of a critical security control through detection, response, restoration and review.",
  ], [
    "Review the security testing programme, roles and procedures for the scoped systems.",
    "Check the inventory of authorised wireless access points and how unauthorised devices are detected and addressed.",
    "Compare vulnerability scan scope, cadence and corrective work with intended coverage and supporting records.",
    "Inspect authorised test scope, qualifications, segmentation validation and retest evidence.",
    "Review detection coverage and follow-up for suspicious network activity, including applicable service-provider duties.",
    "Sample change-detection logic and trace an alert for protected files or payment-page content to response.",
  ], [
    "Review policy approval, review dates, accountability and publication to relevant personnel.",
    "Check acceptable-use terms for end-user technology and how approvals and exceptions are handled.",
    "Inspect targeted risk analyses and their rationale where the published standard permits a risk-based decision.",
    "Review accountable oversight and sample compliance activities, including independent review where it applies.",
    "Reconcile scoped components, account-data flows and dependencies with the current scope confirmation.",
    "Review awareness training and how subjects such as phishing and acceptable use reach relevant staff.",
    "Sample personnel screening appropriate to access while accounting for legal and regional limits.",
    "Compare third-party arrangements, monitoring and division of responsibilities with actual services.",
    "Check service-provider acknowledgements and the information supplied to customers about shared responsibilities.",
    "Review incident readiness, contact channels, training and exercises. Trace follow-up on a payment incident scenario.",
  ],
] as const;
