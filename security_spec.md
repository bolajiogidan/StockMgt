# Security Specification - LabTrack Pro

## Data Invariants
1. A **Transaction** must always reference a valid **Asset** and a valid **User**.
2. Only **Admins** and **Technicians** can manage the **Assets** collection (create/update/delete).
3. **Users** can only read their own profile, except **Admins** who can list all users.
4. **Transactions** can only be created by **Technicians/Admins** (representing a check-out desk) or by a user for themselves (if allowed by business logic, but here we assume a technician facilitates).
5. **Assets** quantity cannot be negative.
6. **Timestamps** must be server-generated.

## The "Dirty Dozen" Payloads (Attacks)
1. **Identity Spoofing**: Creating a user profile with `role: 'admin'` as a new student.
2. **Identity Spoofing**: Updating another user's profile.
3. **Privilege Escalation**: A technician trying to delete an asset (only Admin allowed).
4. **Resource Poisoning**: Creating an asset with a 1MB string in the `name` field.
5. **ID Poisoning**: Trying to create a document with a massive/junk ID.
6. **Orphaned Writes**: Creating a transaction for a non-existent asset.
7. **Bypassing Immutability**: Changing the `assetId` or `userId` on an existing transaction.
8. **State Shortcutting**: Updating a transaction status to 'completed' without setting a `returnDate`.
9. **Denial of Wallet**: Flooding the database with massive arrays (though we don't use arrays much here).
10. **Query Scaping**: Listing the entire `users` collection as a student.
11. **PII Leak**: Getting another user's email address by document ID.
12. **Future Timestamping**: Setting a `createdAt` date in the year 3000.

## The Test Runner
`firestore.rules.test.ts` (conceptual for this environment, but I will provide the rules that prevent these).
