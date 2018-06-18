'use strict';

const aws = require('aws-sdk');

const ec2client = new aws.EC2();

const ruleChecker = require('./lib/checker');

module.exports.monitor = (event, context, callback) => {
  const instanceId = event.detail['instance-id'];
  console.log('test CI');

  ruleChecker.invalid(ec2client, instanceId)
    .then((res) => {
      if (res) {
        ec2client.terminateInstances({
          InstanceIds: [instanceId],
        })
          .promise()
          .then(del =>
            del.TerminatingInstances.forEach(e =>
              console.log(`Terminating invalid instance ${e.InstanceId}`)));
      }
    });

  callback(null, true);
};
