import { z } from "zod";

// Use the interpreter under the academy's strict script-src policy. In Firefox,
// even Zod's caught Function-constructor probe emits a CSP violation.
z.config({ jitless: true });

export { z };
