# IDP

## ENV Variables

### Mongodb

mozes koristiti compose iz xauth projekta

```bash
export MONGODB_URI=mongodb://xauth:xauth@localhost:27017/xauth`
```

### NODE_ENV

when `production` mode is set server will use proxy node

```bash
export NODE_ENV=production
```

### PORT

```bash
export PORT=3000
```

## ENV Variables

# Auth Script

### when go thrugh proxy node needs to have root certificate of proxy

```bash
export NODE_EXTRA_CA_CERTS=($mkcert -CAROOT)/rootCA.pem
```

# Proxy Node

ovo je proxy koji ima ssl certificate na sebi i sluzi kao proxy za idp da bi imao secure konekciju sa clientom
`./example/proxy/proxy.sh`
run script
