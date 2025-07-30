// AI prompt templates for security enhancement

import type { SecurityPrompt } from "../types.js";

export function createSecurityPrompt(
  fileName: string,
  fileContent: string,
): SecurityPrompt {
  const systemPrompt = `Analyze TypeScript DTO files and enhance them with intelligent, security-focused validation decorators

<prompt_objective>
Transform TypeScript DTO file by adding security-focused validation decorators based on field names and types, replacing existing validators while preserving custom business logic decorators, and return reason and enhanced file.
</prompt_objective>

<prompt_rules>
- ALWAYS use @IsUUID(4) for tokens, IDs, and keys (userToken, sessionToken, userId, apiKey, anything ending with Id/Token/Key)
- NEVER use @IsString() - ALWAYS use @Matches() with secure patterns that block injection characters: () [] {} <> ; : " \` $ @ # % ^ & * = + | \\ / ~
- NEVER add @IsNotEmpty() when other validators already ensure non-empty (IsEmail, IsUUID, IsUrl validate non-empty)
- ONLY use Transform for critical security needs or email normalization
- PRESERVE all custom decorators (non class-validator/transformer ones like @TransformNullToMaxDate)
- REPLACE all class-validator/transformer decorators with security-enhanced versions
- RESPECT original property types - if string add string validation, if number add number validation
- DO NOT add comments after decorators - keep code clean
- ENHANCE all @ApiProperty decorators with security-aware descriptions and examples
- HANDLE nested DTOs and arrays with proper validation
- DETECT enum fields and add @IsEnum() validation
- When ambiguous (e.g., customerId), look for context clues but DEFAULT to @IsUUID(4)
- SECURITY OVERRIDES CONVENIENCE - always choose the stricter validation
- If type conflicts with field name (string age), ADD validation for the type but include // ALERT: comment
- INCLUDE all necessary imports at the top
</prompt_rules>

<secure_patterns>
For names (firstName, lastName, fullName):
@Matches(/^[a-zA-Z\\u0080-\\uFFFF\\s'-]+$/, {
  message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
}) // Blocks: numbers, () [] {} <> ; : " \` $ @ # % ^ & * = + | \\ / ~

For general text (description, bio, notes, message):
@Matches(/^[a-zA-Z0-9\\u0080-\\uFFFF\\s.,!?'_-]+$/, {
  message: 'Field can contain letters, numbers, spaces, and basic punctuation (.,!?\\'_-)'
}) // Blocks: () [] {} <> ; : " \` $ @ # % ^ & * = + | \\ / ~

For usernames:
@Matches(/^[a-zA-Z0-9_-]+$/, {
  message: 'Username can only contain letters, numbers, underscores, and hyphens'
})

For addresses:
@Matches(/^[a-zA-Z0-9\\u0080-\\uFFFF\\s.,'#-]+$/, {
  message: 'Address can contain letters, numbers, spaces, periods, commas, apostrophes, # and hyphens'
})

For zip codes:
@Matches(/^[a-zA-Z0-9\\s-]+$/, {
  message: 'ZIP code can contain letters, numbers, spaces, hyphens'
})
</secure_patterns>

<field_patterns>
Tokens/IDs (HIGHEST PRIORITY):
- *Token, *Id, *Key, apiKey, secretKey, authKey → @IsUUID(4)

Personal Information:
- firstName, lastName, fullName → secure name pattern + @Length(2, 50)
- email* → @IsEmail() + @MaxLength(255)
- phone*, mobile* → @IsPhoneNumber(null)
- age (if number) → @IsInt() + @Min(0) + @Max(150)

Credentials:
- password* → @MinLength(8) + @MaxLength(100) + secure pattern
- username → username pattern + @Length(3, 30)

Financial:
- price, amount, cost → @IsInt() + @Min(0) + @Max(999999)
- creditCard → @IsCreditCard()
- cvv → @Matches(/^[0-9]{3,4}$/)

Content:
- description, bio, about, notes → secure text pattern + @MaxLength(1000)
- url, website, link → @IsUrl({ protocols: ['https'], require_protocol: true })

Dates:
- *At, *Date → @IsISO8601({ strict: true })

Arrays:
- tags, categories → @IsArray() + @ArrayMaxSize(50) + pattern with { each: true }

Enums:
- status, role, type → @IsEnum(InferredEnum)
</field_patterns>

<prompt_examples>
USER: 
\`\`\`typescript
import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  userToken: string;
  
  @IsString()
  sessionId: string;
}
\`\`\`

AI:
/*
 * Security Enhancement Summary:
 * - Replaced @IsString() with @IsUUID(4) for userToken and sessionId to prevent injection attacks
 * - Enhanced @ApiProperty with security-aware descriptions and examples
 */
import { IsUUID, ApiProperty } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'User authentication token - UUID v4 format required for security',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(4)
  userToken: string;
  
  @ApiProperty({
    description: 'Session identifier - UUID v4 format required',
    example: '987fcdeb-51a2-43d1-9876-543210fedcba'
  })
  @IsUUID(4)
  sessionId: string;
}

USER:
\`\`\`typescript
export class UserDto {
  @IsString()
  firstName: string;
  
  @IsString()
  age: string;
  
  description: string;
}
\`\`\`

AI:
/*
 * Security Enhancement Summary:
 * - Added secure @Matches patterns for firstName and description to prevent injection attacks
 * - Replaced @IsString() with numeric validation pattern for age field
 * - Added length constraints to prevent DoS attacks
 * - Enhanced @ApiProperty with security-aware descriptions
 */
import { Matches, Length, MaxLength, ApiProperty } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @Matches(/^[a-zA-Z\\u0080-\\uFFFF\\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  })
  @Length(2, 50)
  firstName: string;
  
  @ApiProperty({
    description: 'User age',
    example: '25'
  })
  @Matches(/^[0-9]+$/, {
    message: 'Age must contain only numbers'
  })
  @Length(1, 3)
  age: string;
  
  @ApiProperty({
    description: 'User profile description',
    example: 'Software developer passionate about security'
  })
  @Matches(/^[a-zA-Z0-9\\u0080-\\uFFFF\\s.,!?'_-]+$/, {
    message: 'Field can contain letters, numbers, spaces, and basic punctuation (.,!?\\'_-)'
  })
  @MaxLength(1000)
  description: string;
}

USER:
\`\`\`typescript
import { TransformNullToMaxDate } from '@company/decorators';
import { IsString, IsNotEmpty } from 'class-validator';

export class BookingDto {
  @TransformNullToMaxDate()
  @IsString()
  @IsNotEmpty()
  expiryDate: string;
  
  @IsString()
  companyId: string;
}
\`\`\`

AI:
/*
 * Security Enhancement Summary:
 * - Preserved custom @TransformNullToMaxDate() decorator and enhanced with @IsISO8601 validation
 * - Replaced @IsString() with @IsUUID(4) for companyId to prevent injection attacks
 * - Enhanced @ApiProperty with security-aware descriptions
 */
import { IsUUID, IsISO8601, ApiProperty } from 'class-validator';
import { TransformNullToMaxDate } from '@company/decorators';

export class BookingDto {
  @ApiProperty({
    description: 'Booking expiry date in ISO 8601 format',
    example: '2024-12-31T23:59:59Z'
  })
  @TransformNullToMaxDate()
  @IsISO8601({ strict: true })
  expiryDate: string;
  
  @ApiProperty({
    description: 'Company identifier - UUID v4 format required',
    example: '987fcdeb-51a2-43d1-9876-543210fedcba'
  })
  @IsUUID(4)
  companyId: string;
}

USER:
\`\`\`typescript
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ContactDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
  
  @IsString()
  message: string;
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;
}
\`\`\`

AI:
/*
 * Security Enhancement Summary:
 * - Removed redundant @IsNotEmpty() since @IsEmail() already validates non-empty
 * - Added secure @Matches pattern for message field to prevent injection attacks
 * - Replaced @IsString() with @IsPhoneNumber() for phone validation
 * - Added length constraints to prevent DoS attacks
 * - Enhanced @ApiProperty with security-aware descriptions
 */
import { IsEmail, Matches, MaxLength, MinLength, IsOptional, IsPhoneNumber, ApiProperty } from 'class-validator';

export class ContactDto {
  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@example.com'
  })
  @IsEmail()
  @MaxLength(255)
  email: string;
  
  @ApiProperty({
    description: 'Contact message',
    example: 'Hello, I need help with...'
  })
  @Matches(/^[a-zA-Z0-9\\u0080-\\uFFFF\\s.,!?'_-]+$/, {
    message: 'Field can contain letters, numbers, spaces, and basic punctuation (.,!?\\'_-)'
  })
  @MinLength(2)
  @MaxLength(1000)
  message: string;
  
  @ApiProperty({
    description: 'Contact phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;
}

USER:
\`\`\`typescript
export class PaymentDto {
  @IsString()
  paymentToken: string;
  
  @IsNumber()
  amount: number;
  
  customerId: string;
}
\`\`\`

AI:
/*
 * Security Enhancement Summary:
 * - Replaced @IsString() with @IsUUID(4) for paymentToken and customerId to prevent injection attacks
 * - Added proper number validation with decimal places constraint for amount field
 * - Added Min/Max constraints to prevent negative amounts and unrealistic values
 * - Enhanced @ApiProperty with security-aware descriptions and examples
 */
import { IsUUID, IsNumber, Min, Max, ApiProperty } from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    description: 'Payment token - UUID v4 format required for security',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(4)
  paymentToken: string;
  
  @ApiProperty({
    description: 'Payment amount',
    example: 99.99,
    minimum: 0,
    maximum: 999999.99
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  amount: number;
  
  @ApiProperty({
    description: 'Customer identifier - UUID v4 format required',
    example: '987fcdeb-51a2-43d1-9876-543210fedcba'
  })
  @IsUUID(4)
  customerId: string;
}
</prompt_examples>

OUTPUT REQUIREMENTS:
- Return the complete enhanced TypeScript file content
- Add a comment block at the very beginning of the file explaining what security enhancements were made
- Use this format for the comment block:
/*
 * Security Enhancement Summary:
 * - Brief explanation of changes made
 * - List specific improvements
 */
- Include all necessary imports
- Don't add markdown backticks around the code`;

  const userPrompt = `<file>${fileName}</file> <content>${fileContent}</content>`;

  return {
    system: systemPrompt,
    user: userPrompt
  };
}
