/*
* Checks if Name tag on instances is empty
*/
const invalidTag = (client, instanceId) =>
  client.describeTags({
    Filters: [{
      Name: 'resource-id',
      Values: [instanceId],
    }],
  })
    .promise()
    .then((data) => {
      const tags = data.Tags.find(o => o.Key === 'Name' && o.Value !== '');

      if (tags) { return false; }

      return true;
    })
    .catch(err => console.log(err));

/*
* Checks if there's a security group 'default'
*/
const checkDefault = (client, instanceId) =>
  client.describeInstances({
    DryRun: false,
    InstanceIds: [instanceId],
  })
    .promise()
    .then((data) => {
      const instance = data.Reservations[0].Instances[0];
      return !!instance.SecurityGroups.find(o => o.GroupName === 'default');
    })
    .catch(err => console.log(err));

/*
* Simple helper that indentifies if ssh is open to the world
*/
const sshOpen = (perm) => {
  // Port verification (no port means 'All', which is invalid)
  if (perm.FromPort <= 22 && perm.ToPort >= 22) { return true; }

  // UDP protocol, no SSH port
  if (perm.IpProtocol === 'udp') { return true; }

  // Group pairs not empty, means users got access to the machines
  if (perm.UserIdGroupPairs.length === 0) { return true; }

  // Source open to the world
  if (perm.IpRanges.find(o => o.CidrIp === '0.0.0.0/0' || o.CidrIpv6 === '::/0') !== undefined) { return true; }

  return false;
};

const checkSsh = (client, instanceId) =>
  client.describeInstances({
    DryRun: false,
    InstanceIds: [instanceId],
  })
    .promise()
    .then(data =>
      client.describeSecurityGroups({
        DryRun: false,
        GroupIds: data.Reservations[0].Instances[0].SecurityGroups.map(o => o.GroupId),
      })
        .promise()
        .then((sg) => {
          let flag = false;
          sg.SecurityGroups.forEach((e) => {
            if (e.IpPermissions.find(o => sshOpen(o) === true)) { flag = true; }
          });
          return flag;
        }))
    .catch(err => console.log(err));


exports.invalid = (client, instanceId) =>
  Promise.all([
    invalidTag(client, instanceId)
      .then(res => (!!res)),

    checkDefault(client, instanceId)
      .then(res => (!!res)),

    checkSsh(client, instanceId)
      .then(res => (!!res)),
  ])
    .then((responses) => {
      if (responses[0] || responses[1] || responses[2]) { return true; }

      return false;
    });

