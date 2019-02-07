# ttek-rota-api

## Project setup

```
npm install
npm install -g serverless
```

### Set serverless credentials

```
sls config credentials --provider aws --key <access-key> --secret <secret-key>
```

### Add secrets.json

```
{
	"DB": "mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true",
	"JWT_SECRET": "",
	"SENDGRID_KEY": ""
}
```

### Run API on localhost

```
sls offline start
```

### Deploy to AWS

```
sls deploy [--stage <stage>] [--region <region>]
```
