// AI prompt templates for security enhancement

export function createSecurityPrompt(
  fileName: string,
  fileContent: string,
): string {
  return `
File: ${fileName}
<content>${fileContent}</content>

**CRITICAL SECURITY ALERT**: We had a serious incident where someone passed a SQL function as \`userToken\` because validation was only \`@IsString()\` and nearly hacked us!

You are a security-focused TypeScript code analyzer. Your task is to analyze the provided TypeScript request/DTO file and enhance it with proper validation decorators for security and data integrity.

## **NEVER USE @IsString() FOR TOKENS OR IDs!**

**High-priority token/ID patterns - ALWAYS use UUID validation:**
- \`userToken\` → \`@IsUUID(4)\` + \`@IsNotEmpty()\` (this was our attack vector!)
- \`sessionToken\`, \`accessToken\`, \`refreshToken\` → \`@IsUUID(4)\` + \`@IsNotEmpty()\`
- \`contextId\`, \`userId\`, \`companyId\`, \`organizationId\` → \`@IsUUID(4)\` + \`@IsNotEmpty()\`
- \`apiKey\`, \`secretKey\`, \`authKey\` → \`@IsUUID(4)\` + \`@IsNotEmpty()\`

## Critical Security Rules

### **Token/ID Validation (HIGHEST PRIORITY)**
// NEVER DO THIS - Vulnerable to injection
@IsString()
userToken: string;

// ALWAYS DO THIS - Secure
@IsUUID(4)
@IsNotEmpty()
@Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
userToken: string;

### **Other Security Patterns**

**Authentication Fields:**
- \`email\` → \`@IsEmail()\` + \`@MaxLength(255)\` + \`@Transform(({ value }) => value?.toLowerCase()?.trim())\`
- \`password\` → \`@IsStrongPassword()\`
- \`role\` → \`@IsEnum()\`

**Advanced Security Patterns:**
- Arrays → \`@IsArray()\` + \`@ArrayMaxSize(100)\` + \`@ArrayNotEmpty()\`
- Search queries → \`@MaxLength(100)\` + \`@Matches(/^[a-zA-Z0-9\\\\s\\\\-_]+$/)\`
- Nested objects → \`@ValidateNested()\` + \`@Type(() => NestedClass)\`

### **Available Imports**
import {
  IsString, IsNotEmpty, IsUUID, IsEmail, IsOptional, MaxLength, MinLength,
  IsInt, Min, Max, IsArray, ArrayMaxSize, ArrayMinSize, IsEnum, Matches,
  IsUrl, IsISO8601, IsStrongPassword, IsMongoId, IsPositive,
  IsNumber, NotContains, IsIn, ArrayUnique, IsDefined, Contains,
  IsBoolean, IsDate, Length, IsBooleanString, IsNumberString, IsAlpha,
  IsAlphanumeric, IsAscii, IsBase64, IsCreditCard, IsHexadecimal, IsIP,
  IsJSON, IsJWT, IsLowercase, IsUppercase, IsMobilePhone, IsPhoneNumber,
  ArrayNotEmpty, ArrayContains, ArrayNotContains, IsInstance, Allow,
  ValidateNested, ValidateIf, Equals, NotEquals, IsEmpty, MinDate, MaxDate,
  IsNegative, IsDivisibleBy
} from 'class-validator';

import { Transform } from @claude explain

## Your Task
1. **SCAN FOR SECURITY VULNERABILITIES**: Identify ALL token/ID fields and apply UUID validation
2. **ENHANCE ALL VALIDATIONS**: Add comprehensive security-focused validation to every property
3. **ADD MISSING IMPORTS**: Include all necessary class-validator imports at the top
4. **APPLY TRANSFORMS**: Add sanitization transforms where appropriate
5. **RETURN ENHANCED FILE**: Preserve exact file structure with added security validations

**CRITICAL OUTPUT FORMAT REQUIREMENTS:**
- Return ONLY the raw TypeScript code
- DO NOT wrap the response in \`\`\`typescript code blocks
- DO NOT add any explanatory text before or after the code
- Return the complete file content as plain text that can be directly written to a .ts file
- Preserve exact formatting, spacing, and structure of the original file

**Remember**: The \`userToken\` incident shows why content validation is critical - type validation alone is not enough!
`;
}
