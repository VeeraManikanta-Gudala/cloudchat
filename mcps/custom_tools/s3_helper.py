import json
import boto3
from typing import Annotated
from portia import tool

@tool
def create_s3_bucket_public_rw(
    bucket_name: Annotated[str, "Name of the bucket to create"],
    region: Annotated[str, "AWS region, e.g., us-east-1"] = "us-east-1"
) -> str:
    """
    Creates a public S3 bucket with READ + WRITE access (anyone can upload/download).
    ⚠️ Warning: This is insecure for production.
    """
    s3 = boto3.client("s3", region_name=region)
    full_bucket_name = bucket_name + "-poria-agent-veera"

    try:
        # Create bucket
        if region == "us-east-1":
            s3.create_bucket(Bucket=full_bucket_name)
        else:
            s3.create_bucket(
                Bucket=full_bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )

        # Disable public access blocking
        s3.put_public_access_block(
            Bucket=full_bucket_name,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": False,
                "IgnorePublicAcls": False,
                "BlockPublicPolicy": False,
                "RestrictPublicBuckets": False,
            },
        )

        # Public policy (read + write)
        public_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadWrite",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject", "s3:PutObject"],
                    "Resource": f"arn:aws:s3:::{full_bucket_name}/*"
                }
            ]
        }
        s3.put_bucket_policy(Bucket=full_bucket_name, Policy=json.dumps(public_policy))

        # Construct endpoint
        endpoint = f"https://{full_bucket_name}.s3.{region}.amazonaws.com/"
        connection_info = (
            f"S3 bucket '{full_bucket_name}' created with PUBLIC READ + WRITE.\n"
            f"Public URL / connection string: {endpoint}"
        )

        return connection_info

    except Exception as e:
        return f"Failed to create bucket: {str(e)}"

# ----------------- List All S3 Buckets -----------------
@tool
def list_s3_buckets(region: Annotated[str, "AWS region, e.g., us-east-1"] = "us-east-1") -> str:
    """
    Lists all S3 buckets in your AWS account.
    """
    s3 = boto3.client("s3", region_name=region)
    try:
        response = s3.list_buckets()
        buckets = [b["Name"] for b in response.get("Buckets", [])]
        if not buckets:
            return "No S3 buckets found in your account."
        return "S3 Buckets:\n" + "\n".join(buckets)
    except Exception as e:
        return f"Failed to list buckets: {str(e)}"


# ----------------- Delete S3 Bucket -----------------
@tool
def delete_s3_bucket(
    bucket_name: Annotated[str, "Name of the bucket to delete"],
    region: Annotated[str, "AWS region, e.g., us-east-1"] = "us-east-1"
) -> str:
    """
    Deletes an S3 bucket. Bucket must be empty before deletion.
    """
    s3 = boto3.client("s3", region_name=region)
    try:
        # First, check if bucket exists
        existing_buckets = [b["Name"] for b in s3.list_buckets().get("Buckets", [])]
        if bucket_name not in existing_buckets:
            return f"Bucket '{bucket_name}' does not exist."

        # Optional: Delete all objects before bucket deletion
        try:
            objects = s3.list_objects_v2(Bucket=bucket_name).get("Contents", [])
            if objects:
                for obj in objects:
                    s3.delete_object(Bucket=bucket_name, Key=obj["Key"])
        except Exception:
            pass  # If bucket is already empty, ignore

        # Delete bucket
        s3.delete_bucket(Bucket=bucket_name)
        return f"S3 bucket '{bucket_name}' deleted successfully."

    except Exception as e:
        return f"Failed to delete bucket: {str(e)}"
