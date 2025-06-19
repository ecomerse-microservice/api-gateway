import { VersioningType, VersioningOptions } from '@nestjs/common';
export const versioningConfig: VersioningOptions = {
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'v',
};

export const apiVersions = ['1'];
