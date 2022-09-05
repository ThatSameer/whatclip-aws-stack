#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WhatclipAwsAppStack } from '../lib/whatclip-aws-app-stack';

const app = new cdk.App();
new WhatclipAwsAppStack(app, 'WhatclipAwsAppStack');
