# Which File Storage Service should we use?

---

**Last Update:** 2026-05-31

---

## Context and Problem Statement

Collaborative features require server-side storage for the JPEG files that users upload. Once files are shared within a team session, they can no longer live solely in a user's browser IndexedDB — they must be accessible to all session participants. We need an object storage solution to host these files.

## Considered Options

* Cloudflare R2
* AWS S3
* Local disk (server filesystem)

## Decision Outcome

Chosen option: **"Cloudflare R2"**, because

* R2 charges no egress fees, which is the dominant cost driver when serving image files back to users repeatedly.
* Its S3-compatible API means the same `@aws-sdk/client-s3` SDK can be used, keeping the integration straightforward and portable.
* The free tier (10 GB storage, 1 million write operations, 10 million read operations per month) comfortably covers a prototype and early usage.
* It avoids the operational burden of local disk storage while keeping infrastructure costs predictable.

## Pros and Cons of the Options

### Cloudflare R2

#### Pros

* **No egress fees**: Unlike AWS S3, data transferred out of R2 to the internet is free. This is the most significant cost advantage for an application that regularly reads image files.
* **S3-compatible API**: Works with the standard AWS SDK (`@aws-sdk/client-s3`), making the integration familiar and easy to swap if needed.
* **Generous free tier**: 10 GB storage and 10 million read operations per month at no cost.
* **Predictable pricing**: Simple storage and operation pricing without the complex data transfer pricing tiers of AWS.

#### Cons

* **Fewer regions**: R2 does not allow choosing a specific storage region; Cloudflare determines placement automatically.
* **Smaller ecosystem**: Fewer third-party tools and integrations compared to AWS S3, though S3 compatibility mitigates most of this.
* **Requires Cloudflare account**: Adds a dependency on the Cloudflare platform.

### AWS S3

#### Pros

* **Industry standard**: The most widely supported object storage service with an enormous ecosystem of tools and integrations.
* **Fine-grained access control**: IAM policies and bucket policies offer granular permission management.
* **Region control**: Full control over which geographic region data is stored in.

#### Cons

* **Egress fees**: AWS charges for data transferred out of S3, which can become significant when serving JPEG files to multiple users.
* **Pricing complexity**: Data transfer pricing tiers add unpredictability to the monthly bill.
* **Unnecessary overhead**: The broader AWS ecosystem brings complexity that is not needed for object storage alone.

### Local Disk (Server Filesystem)

#### Pros

* **Zero infrastructure cost**: No additional service required; files are stored directly on the application server.
* **Simple implementation**: Standard filesystem APIs, no SDK needed.

#### Cons

* **Not scalable**: Disk space is limited and tied to a single server instance.
* **No redundancy**: Files are lost if the server is replaced or fails without a separate backup strategy.
* **Incompatible with horizontal scaling**: Multiple server instances cannot share a local filesystem, making future scaling impossible without a migration.
