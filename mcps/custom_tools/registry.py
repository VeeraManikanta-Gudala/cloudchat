from litellm import create
from portia import ToolRegistry
from .creatae_ec2_tool import create_ec2_instance, list_ec2_instances, stop_ec2_instances, delete_ec2_instance_by_ip
from .s3_helper import create_s3_bucket_public_rw,list_s3_buckets,delete_s3_bucket

custom_tool_registry = ToolRegistry([
    create_ec2_instance(),
    list_ec2_instances(),
    
    stop_ec2_instances(),
    delete_ec2_instance_by_ip(),

    create_s3_bucket_public_rw(),
    list_s3_buckets(),
    delete_s3_bucket(),

    # Add more custom tools here, e.g., for S3, RDS, etc., following the same pattern
])
