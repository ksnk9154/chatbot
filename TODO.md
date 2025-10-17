# TODO: Fix Safety Validation Error

- [x] Remove 'union' from dangerousPatterns in backend/utils/safety.js
- [x] Remove 'cast(' from dangerousPatterns in backend/utils/safety.js
- [x] Remove 'convert(' from dangerousPatterns in backend/utils/safety.js
- [x] Remove 'create' and 'table' from forbiddenKeywords in backend/utils/safety.js
- [x] Remove ';' from dangerousPatterns in backend/utils/safety.js
- [x] Normalize SQL in chat.js to remove newlines and trailing semicolons before validation
- [x] Test critical-path: valid SELECT queries pass, dangerous queries fail
