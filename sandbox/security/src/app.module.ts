import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SecurityModule } from '@newput-newlink/security';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAuIyA5nucxuxyb+7S8DxD
pPL3nN78/woKIh0pBN0YdDpAch4brQLxLmo6UxrzsiTf7DAYIgua/ZyyIi3LiHiK
HmLu2iFtDCGAUNpJjvzlCNWs02raWbomErTUWRrFSMvK1YXSbTerKMsRaS+qlfFj
v2QwcIllKV5oL7MiiIIfNpibJ9141BRzRZLlvmWNRU97xG5QraMmy+l5GuF/FqNF
DnaUsqDY1Htx/1Bb0MmLJ4Rq8JzwplHbEhHmRfO4OBiZhIGlEN6O2Eod/s2lLPuq
3u7X3VTLEt0puJD1sJLt0FO0yLk5m7VSbXMjLkdS7gSYb1gRVB+VwvxNn+ObfiWw
BBSR5bzrc95jFCrP7337O2LRmC3wYMZ+vfPI5Svkg3sU6juWBkUS1L3Q+zFx9NEv
Q7QphaG6izqIrsz7yRZeT9jsbGsYxOIf/5NxwaTKuYYmYMIk7yo2kVdT8VAsAj33
l8SC4Ncr+ScRYnj/EyLiphFw2FaPlYAsd9cqjkxVDhcXHTpFrQ5iCGkNS3Jx/L9b
LBoXL6scq6tBlChgbT3p7gaQQIOEdufJQrLBDTsh+E1vqZoyD5hrk5/YZnrXKX0e
BRsKyDNlydax+UN88PHcaqXSJ6Igrawug4vtGzz67DIYVJ6vYPL0Va2pmXvVwIiA
IB1vr3ZB00DHgFeiKwoJwKkCAwEAAQ==
-----END PUBLIC KEY-----`;
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIJKQIBAAKCAgEAuIyA5nucxuxyb+7S8DxDpPL3nN78/woKIh0pBN0YdDpAch4b
rQLxLmo6UxrzsiTf7DAYIgua/ZyyIi3LiHiKHmLu2iFtDCGAUNpJjvzlCNWs02ra
WbomErTUWRrFSMvK1YXSbTerKMsRaS+qlfFjv2QwcIllKV5oL7MiiIIfNpibJ914
1BRzRZLlvmWNRU97xG5QraMmy+l5GuF/FqNFDnaUsqDY1Htx/1Bb0MmLJ4Rq8Jzw
plHbEhHmRfO4OBiZhIGlEN6O2Eod/s2lLPuq3u7X3VTLEt0puJD1sJLt0FO0yLk5
m7VSbXMjLkdS7gSYb1gRVB+VwvxNn+ObfiWwBBSR5bzrc95jFCrP7337O2LRmC3w
YMZ+vfPI5Svkg3sU6juWBkUS1L3Q+zFx9NEvQ7QphaG6izqIrsz7yRZeT9jsbGsY
xOIf/5NxwaTKuYYmYMIk7yo2kVdT8VAsAj33l8SC4Ncr+ScRYnj/EyLiphFw2FaP
lYAsd9cqjkxVDhcXHTpFrQ5iCGkNS3Jx/L9bLBoXL6scq6tBlChgbT3p7gaQQIOE
dufJQrLBDTsh+E1vqZoyD5hrk5/YZnrXKX0eBRsKyDNlydax+UN88PHcaqXSJ6Ig
rawug4vtGzz67DIYVJ6vYPL0Va2pmXvVwIiAIB1vr3ZB00DHgFeiKwoJwKkCAwEA
AQKCAgAOACt2RjSjEG9FHSP3xvFQe1X8MBxBoqrD+EeIn4JlAkH/NlgIqd4Pafkx
8qvqx6qM7KrOsxKHgNgFyPN1j27WYSXi5WF0Z7qS8mCIE8OyG3h1/e0B8iHvI4oE
QYhBM87CoK6nC6+1Pk9RliTAT99uoW9IVlrBnEXWBTvOieVMJcsy53XXdxQLWEU2
4CrrHMgpuJRv0TPBXrLJ7odkTwTPP6vxGkv2Nhr0UOMfpZlO6ULuAqYCJC3KbZJf
8QkN3ms6dtXFlXDWVAHPDHMRGihWKzNeuU8CXRt2wwPp/leYNAWAKzHa5X29oRwZ
58jQ7Fx+fqVVPGPcS/pSnI31xcOthjt0cWetwmMXsDajxHWmyFlnp9/wb4LXT7yc
UQSYahlrsZAYDg7Cq9IKqvfbmEjliwXtVB/ytRlTIhuTmRUOhEUycL9jotH4BoKs
vtPr+R2y+m5n53prb4hedQoUAI8yQCC+Z4lGxYlN2RXdJqsO2MWPvaPwVz65BfuI
CT2P4g37RYcABFQJkCOAUlzRJtwUs+7AGA4+VZ57FuPfE7cKV5d4ksVGsdSdfTC2
3I39ao8sQJuIN3/JEQ9sZEcLTn6GS2S9n2GJpp/HdkWkJBlwiSvXDjOcq5ljZ/iH
bXJj3nRL2rWu4KgMeUcW1L9oc789hZvWVrMMdFrn2bi/gVLstQKCAQEA+8QZ9pp4
WvI6pQG/VgbitjVbz37bS62CUXO9Br4osGhuoXOTW1cNSWR07CaYqhkfEsZn9feX
lrsoCWhIwWJYy3LDskYGMuYEwPGrPrvjL5Qm7gzYX6uH8SH++g8tdtCNO57SVwCq
f4iqXmuAzbl9FAst70zbEbFOUFv92Dl7rawgUH80VThGiW/25u0lyqfs0vsJ2bv4
YdaP0d9QKnP9M1i8CiYYdDR9OJFBo1yKi5g2aXgJ8MQJY2TiXDzMXOMaOb+p25gZ
R3KLIqv2jPtEuCZ/ia+oOoQekk23LkJFJ7vYYRdlG6AKxAYv/+ECya3WpHo/UBgD
WV2Rg6getWivDQKCAQEAu6cFF/nqE6B0xuI9Zp3hFy7rcYubLSp7P9IWnFfgvDAj
dBPsQJwN5Xu1ylhuQbT0BkKlj6a+iO/LHFvGbSRRo7543H8xRYA6Qg3jcP6+h/L0
1J6G92QEQcxKUagwVxFFYPcu5yn7ksjILsZp4cem1GHTI1mbipzFVc/l0k5yCmA2
1XLkzKPxRwOydbBdTbRWjfLZBNP+nkcHM8OXlN9tIEWATLNvaEsYaSEHMMzq6Xq6
RQUryQuKnyXgjKoZFLjwihygkwiWX44itO2i5bFWd+q17Cbzurv9l498ZV6uKZ6c
kSILErIhGF6/+RaUrL48Ovovtnab4iSzC/u8Uj0RDQKCAQEAzGcyDRzsiioPotgA
V//PIM/Bcn0z3gVIwIiO92J79n1TFJGZGZdbmjKNGw1a9P7gU4Xx8ajK0f2xS7H3
H8qQ/Nx4NczUS46kXWHX/l7c3EwUL0EOit3gyM0pDiw0ZTp87+LKMwi/ZDu41l/B
e0UVX6iT6q0jTwH86xFEzsAcwav1sGUWP/ooinz0oBf5jsc3ZzOZk8Ugq45fxazg
kRcKgx2PzU2QnQfggoSsHc2MTjmOM6LZrzf5x1Co1uoloWRgbnJFnZunKnK8s7GZ
wmxeJoRbF5YdpySNDYs7Jbt4GgJQcsNju0H8e5nqbnxonwUcNv1pWcWlMnDdK17b
T71mIQKCAQBNjjPuut1hizl4UVzrImk7OasZXIef3STfNaceqrs5S/P7L5i/A0BD
DiQOIwo+odkRFU5z1oh89A5QBCY4SYBsWnZ9OxxUCzEIx9CujLqWWXWSwoopiO6x
ewtkQEzqTzsLXl3GMHXHLrB9lIeCRw/OSzgGLiy41x4/3xKvHrjHTQico0WoxkEc
Bo0lUuTdDqGPPUUwV6WuKNDzNe1aHBVv9wmVqbtrsU2/dWURaD/Wi2Cc0gxMpTZ/
nBn4SPzgsabIjhhXbH8pswbpHCXtJKQGH71cgqTNEpE2qJjTFJSKowE2goltCq3e
8poJCqob0uv1vB0oHlFC38QYOcyVeKOpAoIBAQCQq5VTs5sWnENp7HrqfPekDHzn
ENud9gg8ypO/O0Ut0MWvdKFTk+huk5zD6r6IjRh7p9G17kjWebFOia9QaZiMomw9
59Ku5tfW6UAu+0yua93rIXXyWSkU9Y2ntY8YSTMVflkHI1diu/o1UpDZrXHA5Kxw
/sIa8AOVV4YK0++tyKeqhIMa0sZXRXb/eXS7ktWTAwLBsCLBW2nkmJ6rYLUUp3uL
VWKp4AHxSKe8cO/SQmKxfH9aglH9I18U1wIFYQ+c7Dn0ftycYVNUygWRwcmMM7xS
pP1y0te4+N48b/n5uJ8Xc6JDQTEyDicr3DH1BMukFv+v5Nxp3yLYX3N2zdGV
-----END RSA PRIVATE KEY-----`;
@Module({
  imports: [
    SecurityModule.register({
      xssProtection: true,
      sqlInjectionProtection: true,
      enableRateLimiter: false,
      enableCsrfProtection: false,
      rateLimiter: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
      },
      csrfProtection: {
        secret: 'my-secure-secret',
        cookie: true,
      },
      useEncryption: true,
      rsaConfig: {
        privateKey: privateKey,
        publicKey: publicKey,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
