# SSL Certificate Configuration Guide

## Current Status
Your application currently has **SSL certificate verification disabled** for API calls to NATO IOCore2 servers. This is insecure but sometimes necessary when dealing with internal Certificate Authorities (CAs) that aren't in the system's default trust store.

## SSL Configuration Options

### Option 1: Environment Variables (Recommended)
Set these environment variables to enable SSL verification:

```bash
# Enable SSL verification
export IONIC2_VERIFY_SSL=true

# Optional: Use custom CA bundle
export IONIC2_CA_BUNDLE=/path/to/your/ca-bundle.pem
```

### Option 2: Update Settings Files
Modify the settings directly in the code:

**For main app** (`app/config/settings.py`):
```python
VERIFY_SSL = True  # Change from False to True
CUSTOM_CA_BUNDLE = "/path/to/nato-ca-bundle.pem"  # If you have it
```

**For monitor app** (`shared_core/config/settings.py`):
```python
VERIFY_SSL: bool = True  # Already configurable via environment
```

## Testing Your SSL Configuration

Use the provided SSL test utility:

```bash
# Test with current settings (SSL disabled)
python tools/ssl_test.py https://iocore2-ciav.ivv.ncia.nato.int --no-verify

# Test with SSL verification enabled (system CAs)
python tools/ssl_test.py https://iocore2-ciav.ivv.ncia.nato.int

# Test with custom CA bundle
python tools/ssl_test.py https://iocore2-ciav.ivv.ncia.nato.int --ca-bundle /path/to/ca-bundle.pem

# Find your system's CA bundle location
python tools/ssl_test.py --find-system-ca
```

## Getting the Correct CA Certificate

### For NATO/Internal Systems:
1. **Contact your system administrator** for the NATO CA certificate
2. **Download from browser**: 
   - Visit the IOCore2 site in browser
   - Click the lock icon → Certificate details → Export
3. **Use openssl to extract**:
   ```bash
   echo | openssl s_client -connect iocore2-ciav.ivv.ncia.nato.int:443 -servername iocore2-ciav.ivv.ncia.nato.int | openssl x509 -out nato-ca.pem
   ```

### Installing CA Certificate System-Wide

**macOS:**
```bash
# Add to system keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nato-ca.pem
```

**Linux (Ubuntu/Debian):**
```bash
# Copy to ca-certificates directory
sudo cp nato-ca.pem /usr/local/share/ca-certificates/nato-ca.crt
sudo update-ca-certificates
```

**Linux (RedHat/CentOS):**
```bash
# Copy to ca-trust directory
sudo cp nato-ca.pem /etc/pki/ca-trust/source/anchors/nato-ca.pem
sudo update-ca-trust
```

## Quick Enable/Disable Commands

### Enable SSL Verification:
```bash
# Using environment variable
export IONIC2_VERIFY_SSL=true

# Or edit app/config/settings.py and change:
# VERIFY_SSL = True
```

### Disable SSL Verification (current state):
```bash
# Using environment variable
export IONIC2_VERIFY_SSL=false

# Or ensure app/config/settings.py has:
# VERIFY_SSL = False
```

## Security Considerations

### ✅ Pros of enabling SSL verification:
- **Security**: Prevents man-in-the-middle attacks
- **Authentication**: Ensures you're connecting to the real server
- **Compliance**: Meets security best practices

### ⚠️ Cons of disabling SSL verification:
- **Security Risk**: Vulnerable to MITM attacks
- **No Certificate Validation**: Could connect to malicious servers
- **Warning Messages**: urllib3 warnings (currently suppressed)

## Troubleshooting

### Common Issues:

1. **Certificate Authority Not Trusted**
   ```
   SSLError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
   ```
   **Solution**: Install the NATO CA certificate or provide the correct CA bundle path.

2. **Wrong Certificate Path**
   ```
   SSLError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
   ```
   **Solution**: Verify the `CUSTOM_CA_BUNDLE` path exists and contains the correct certificate.

3. **Network/Firewall Issues**
   ```
   ConnectionError: HTTPSConnectionPool(host='...', port=443): Max retries exceeded
   ```
   **Solution**: Check network connectivity and firewall rules.

## Current Code Locations

The SSL verification setting is used in these files:
- `app/api/client.py` - Main API client
- `shared_core/api/client.py` - Shared API client
- `app/api/iocore2.py` - IOCore2 specific client
- `shared_core/api/iocore2.py` - Shared IOCore2 client

## Recommendations

1. **Short Term**: Keep SSL verification disabled if NATO CA isn't available
2. **Medium Term**: Obtain and install NATO CA certificate system-wide
3. **Long Term**: Enable SSL verification for all production deployments

## Testing Checklist

- [ ] Test current configuration with `--no-verify`
- [ ] Test with system CAs enabled
- [ ] Test with custom CA bundle (if available)
- [ ] Verify all API endpoints work with SSL enabled
- [ ] Check that no SSL warnings appear in logs 