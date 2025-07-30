// AI prompt templates for security enhancement

export function createSecurityPrompt(
  fileName: string,
  fileContent: string,
): string {
  return `
  File: ${fileName}
  <content>${fileContent}</content>

  SECURITY INCIDENT: SQL injection via userToken field that only had @IsString() validation.

  Analyze this TypeScript DTO and enhance with intelligent security-focused validation.

  CRITICAL RULES:

  1. TOKEN/ID VALIDATION PRIORITY
  Always use @IsUUID(4) for:
  - userToken, sessionToken, accessToken, refreshToken
  - userId, companyId, organizationId, contextId, any field ending with Id
  - apiKey, secretKey, authKey (unless explicitly JWT)

  2. SMART VALIDATION (NO REDUNDANCY)
  - @IsEmail(), @IsUUID(), @IsUrl(), @IsMongoId() already validate non-empty
  - Only add @IsNotEmpty() for plain strings with no other validation
  - Use @IsOptional() for optional fields, not @IsNotEmpty()

  3. AVOID TRANSFORMS
  - Do NOT use Transform for trim - expensive operation
  - Only use Transform if absolutely critical for security OR for emails

  4. INTELLIGENT PATTERNS BASED ON FIELD NAME
  Infer validation from field names:

  firstName, lastName, fullName:
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\\s'-]+$/, { message: 'Name can contain letters, spaces, hyphens, apostrophes' })

  username:
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username can contain letters, numbers, underscores, hyphens' })
  @Length(3, 30)

  email, emailAddress, userEmail:
  @IsEmail()
  @MaxLength(255)

  password, userPassword:
  @IsString()
  @MinLength(8)
  @MaxLength(100)

  phone, phoneNumber, mobile:
  @IsPhoneNumber(null) // auto-detect country

  url, website, link:
  @IsUrl({ protocols: ['https'], require_protocol: true })

  age:
  @IsInt()
  @Min(0)
  @Max(150)

  price, amount, cost:
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)

  quantity, count:
  @IsInt()
  @Min(0)
  @Max(10000)

  description, bio, about, notes:
  @IsString()
  @MaxLength(1000)

  date fields (createdAt, updatedAt, birthDate):
  @IsISO8601({ strict: true })

  status:
  @IsEnum(StatusEnum) // infer enum exists

  role, userRole:
  @IsEnum(RoleEnum) // infer enum exists

  tags, categories (arrays):
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)

  5. ENHANCE @ApiProperty WITH SECURITY CONTEXT
  Add meaningful examples and descriptions that explain security implications:

  @ApiProperty({
    description: 'Unique user identifier - UUID v4 format required for security',
    example: '123e4567-e89b-12d3-a456-426614174000',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  })
  @IsUUID(4) // Security: Prevents injection attacks
  userId: string;

  6. ADD SECURITY COMMENTS
  Add brief comment explaining why each validation exists:
  @IsUUID(4) // Security: Prevents injection attacks, allow only exactly uuid4
  @MinLength(8) // Security: Minimum password strength
  @Matches(/^[a-zA-Z0-9_-]+$/) // Security: Prevent special char injection, allows only for alphanumeric characters, underscores, and hyphens
  @ArrayMaxSize(100) // Security: Prevent memory exhaustion

  7. AVAILABLE VALIDATORS (USE ONLY THESE)
  From class-validator:
  IsString, IsNotEmpty, IsUUID, IsEmail, IsOptional, MaxLength, MinLength,
  IsInt, Min, Max, IsArray, ArrayMaxSize, ArrayMinSize, IsEnum, Matches,
  IsUrl, IsISO8601, IsStrongPassword, IsMongoId, IsPositive,
  IsNumber, IsIn, ArrayUnique, IsDefined, Contains,
  IsBoolean, IsDate, Length, IsBooleanString, IsNumberString, IsAlpha,
  IsAlphanumeric, IsAscii, IsBase64, IsCreditCard, IsHexadecimal, IsIP,
  IsJSON, IsJWT, IsLowercase, IsUppercase, IsMobilePhone, IsPhoneNumber,
  ArrayNotEmpty, ValidateNested, ValidateIf, IsEmpty

  From class-transformer:
  Type, Transform (use sparingly)

  TASK:
  1. Identify all security vulnerabilities (especially token/ID fields)
  2. Apply intelligent validation based on field names and context
  3. Add security-focused comments explaining each validation
  4. Enhance @ApiProperty with security-aware descriptions and examples
  5. Add proper imports at file top
  6. Preserve exact file structure, if the property is number, don't change it to string. Don't modify original properties types.

  OUTPUT REQUIREMENTS:
  - Return ONLY raw TypeScript code
  - NO markdown code blocks
  - Complete file ready to save as .ts
  - Include all necessary imports
  `;
}
