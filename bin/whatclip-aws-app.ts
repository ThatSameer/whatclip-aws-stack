#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WhatclipAwsAppStack } from '../src/lib/whatclip-aws-app-stack';

const app = new cdk.App();
new WhatclipAwsAppStack(app, 'WhatclipAwsAppStack');