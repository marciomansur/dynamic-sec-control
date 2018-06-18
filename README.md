## Dynamic Security Control
=========================   

[![pipeline status](https://gitlab.com/marciomansur/dynamic-sec-control/badges/develop/pipeline.svg)](https://gitlab.com/marciomansur/dynamic-sec-control/commits/develop)


A dynamic security service written using AWS lambda to control machines provisioning based on security groups rules

### Prerequisites

- Nodejs 6.10.0 (https://nodejs.org/)
- Serverless (https://serverless.com/)
- AWS CLI (https://github.com/marciomansur/docker-aws-cli)
- A Gitlab repo (https://gitlab.com/marciomansur/dynamic-sec-control)

### Deploy

- Run `npm install` to install and dependencies
- Change `profile` at `serverless.yml` with yours
- Run:

```
serverless deploy -v
```

### Debug

In one terminal window, run:

```
serverless logs -f monitor -t
```

Run some instances trying to test the rules or try:

```
serverless invoke -f monitor
```

OBS: It won't work without AWS CloudWatch Event.
