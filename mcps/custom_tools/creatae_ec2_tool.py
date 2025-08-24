import boto3
from typing import Annotated
from portia import tool
from botocore.exceptions import ClientError


@tool
def create_ec2_instance(
    instance_type: Annotated[str, "The EC2 instance type"] = "t2.micro",
    region: Annotated[str, "The AWS region"] = "us-east-1",
    key_name: Annotated[str, "The name of an existing EC2 key pair (optional, if you want SSH access)"] = "tester"
) -> str:
    """Creates a new AWS EC2 instance and returns its public IP.
    If the security group already exists, it will be reused.
    """

    ec2 = boto3.client("ec2", region_name=region)

    # Security group name (make it unique per instance type for clarity)
    sg_name = f"portia-sg-{instance_type}"

    try:
        # Try creating the SG
        sg_response = ec2.create_security_group(
            GroupName=sg_name,
            Description="Security group for Portia EC2 instances",
        )
        sg_id = sg_response["GroupId"]
    except ClientError as e:
        if "InvalidGroup.Duplicate" in str(e):
            # SG already exists → fetch its ID
            existing_sg = ec2.describe_security_groups(GroupNames=[sg_name])
            sg_id = existing_sg["SecurityGroups"][0]["GroupId"]
        else:
            raise

    # Launch instance
    response = ec2.run_instances(
        ImageId="ami-020cba7c55df1f615",  # Amazon Linux 2 in us-east-1
        InstanceType=instance_type,
        MinCount=1,
        MaxCount=1,
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
    )

    instance_id = response["Instances"][0]["InstanceId"]

    # Wait until instance is running
    waiter = ec2.get_waiter("instance_running")
    waiter.wait(InstanceIds=[instance_id])

    # Fetch public IP
    instance_info = ec2.describe_instances(InstanceIds=[instance_id])
    public_ip = instance_info["Reservations"][0]["Instances"][0].get(
        "PublicIpAddress", "No public IP assigned"
    )

    return f"EC2 instance {instance_id} created in {region}. Public IP: {public_ip} (using SG {sg_name})"



@tool
def list_ec2_instances(region: str = "us-east-1") -> str:
    """Lists all EC2 instances in the given region with ID, launch time, and Public IP."""

    ec2 = boto3.client("ec2", region_name=region)
    response = ec2.describe_instances()

    instances = []
    for reservation in response["Reservations"]:
        for instance in reservation["Instances"]:
            instance_id = instance["InstanceId"]
            launch_time = instance["LaunchTime"].strftime("%Y-%m-%d %H:%M:%S")
            public_ip = instance.get("PublicIpAddress", "N/A")
            state = instance["State"]["Name"]

            instances.append(
                f"ID: {instance_id} | State: {state} | Launched: {launch_time} | Public IP: {public_ip}"
            )

    if not instances:
        return f"No EC2 instances found in {region}."

    return "\n".join(instances)


@tool
def stop_ec2_instances(region: str = "us-east-1") -> str:
    """Stops all running EC2 instances in the given region."""

    ec2 = boto3.client("ec2", region_name=region)
    response = ec2.describe_instances()

    running_instances = []
    for reservation in response["Reservations"]:
        for instance in reservation["Instances"]:
            if instance["State"]["Name"] == "running":
                running_instances.append(instance["InstanceId"])

    if not running_instances:
        return f"No running instances found in {region}."

    ec2.stop_instances(InstanceIds=running_instances)

    return f"Stopping {len(running_instances)} instance(s): {', '.join(running_instances)}"

@tool
def delete_ec2_instance_by_ip(
    public_ip: Annotated[str, "Public IP of the EC2 instance to terminate"],
    region: Annotated[str, "AWS region, e.g., us-east-1"] = "us-east-1"
) -> str:
    """
    Terminates an EC2 instance with the given public IP address.
    """

    ec2 = boto3.client("ec2", region_name=region)

    # Find instance ID by public IP
    response = ec2.describe_instances(
        Filters=[{"Name": "ip-address", "Values": [public_ip]}]
    )

    instances = []
    for reservation in response["Reservations"]:
        for instance in reservation["Instances"]:
            instances.append(instance["InstanceId"])

    if not instances:
        return f"No EC2 instance found with public IP {public_ip} in {region}."

    # Terminate instance(s)
    ec2.terminate_instances(InstanceIds=instances)

    return f"Terminating {len(instances)} instance(s) with public IP {public_ip}: {', '.join(instances)}"
