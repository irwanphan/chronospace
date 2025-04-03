import forge from 'node-forge';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { encrypt } from './encryption';

interface GenerateCertificateParams {
  userId: string;
  commonName: string;
  email: string;
  organization: string;
  validityDays?: number;
}

export async function generateUserCertificate({
  userId,
  commonName,
  email,
  organization,
  validityDays = 365
}: GenerateCertificateParams) {
  // Check if user has active certificate
  const activeCert = await prisma.userCertificate.findFirst({
    where: {
      userId,
      isActive: true,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (activeCert) {
    throw new Error('User already has an active certificate');
  }

  // Generate key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);

  // Create X.509 certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = randomBytes(16).toString('hex');
  
  // Set certificate validity
  const now = new Date();
  cert.validity.notBefore = now;
  cert.validity.notAfter = new Date(now.getTime() + (validityDays * 24 * 60 * 60 * 1000));

  // Set certificate attributes
  const attrs = [{
    name: 'commonName',
    value: commonName
  }, {
    name: 'emailAddress',
    value: email
  }, {
    name: 'organizationName',
    value: organization
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Set extensions
  cert.setExtensions([{
    name: 'keyUsage',
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    clientAuth: true,
    emailProtection: true,
    codeSigning: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 6, // URI
      value: `urn:uuid:${userId}`
    }, {
      type: 1, // email
      value: email
    }]
  }]);

  // Self-sign the certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Generate random password for P12
  const p12Password = randomBytes(16).toString('hex');

  // Create PKCS#12
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey,
    [cert],
    p12Password,
    {
      algorithm: '3des',
      friendlyName: commonName,
      generateLocalKeyId: true
    }
  );

  // Convert to binary
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12Buffer = Buffer.from(p12Der, 'binary');

  // Store in database
  const userCert = await prisma.userCertificate.create({
    data: {
      userId,
      serialNumber: cert.serialNumber,
      p12cert: p12Buffer,
      password: await encrypt(p12Password), // Encrypt password before storing
      expiresAt: cert.validity.notAfter,
      isActive: true
    }
  });

  return {
    certificateId: userCert.id,
    serialNumber: userCert.serialNumber,
    expiresAt: userCert.expiresAt,
    p12Buffer,
    p12Password
  };
} 