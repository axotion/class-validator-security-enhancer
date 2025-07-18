# Class Validator Security Enhancer

AI-powered security enhancement tool for [class-validator](https://github.com/typestack/class-validator). This tool automatically scans your TypeScript files and enhances them with robust security validation decorators using Google's Gemini AI.

## 🔧 Features

- **AI-Powered Enhancement**: Uses Google Gemini models to intelligently enhance validation
- **Multiple Model Support**: Choose from Gemini 2.5 Flash, Gemini 2.5 Pro
- **Configurable Patterns**: Scan custom file patterns or default `.request.ts`/`.dto.ts` files
- **In-Place Modification**: Modifies original files for easy pull request creation
- **Cost Calculation**: Shows token usage and pricing estimates before processing
- **Security-First**: Focuses on critical security patterns for tokens, IDs, and user inputs

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/axotion/class-validator-security-enhancer.git
cd class-validator-security-enhancer

# Install dependencies using Bun
bun install

# Set up your Google AI API key
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

## 📖 Usage

```bash
# Run the security enhancer on your project
bun run main.ts /path/to/your/project

# Or use the npm scripts
bun start /path/to/your/project
```

## 🔒 Security Enhancements Applied

### Critical Token/ID Security
```typescript
// ❌ BEFORE (Vulnerable)
@IsString()
userToken: string;

// ✅ AFTER (Secure)
@IsUUID(4)
@IsNotEmpty()
@Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
userToken: string;
```

### Email Security
```typescript
// ❌ BEFORE
@IsString()
email: string;

// ✅ AFTER
@IsEmail()
@MaxLength(255)
@Transform(({ value }) => value?.toLowerCase()?.trim())
email: string;
```

### Array Security
```typescript
// ❌ BEFORE
@IsArray()
tags: string[];

// ✅ AFTER
@IsArray()
@ArrayMaxSize(100)
@ArrayNotEmpty()
@IsString({ each: true })
@MaxLength(50, { each: true })
tags: string[];
```

## 🎯 Target Patterns

The tool automatically detects and secures:

- **Tokens & IDs**: `userToken`, `contextId`, `sessionToken`, `apiKey`
- **Authentication**: `email`, `password`, `role`
- **User Input**: Search queries, descriptions, file names
- **Arrays**: Size limits, element validation, uniqueness
- **Nested Objects**: Proper `@ValidateNested()` usage
- **Enums**: Replace `@IsString()` with `@IsEnum()`

## 📝 Requirements

- **Bun**: >= 1.0.0
- **Google AI API Key**: For Gemini model access
- **TypeScript Files**: Works with `.ts` and `.js` files containing `@ApiProperty()` decorators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the tool on test files to verify functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Important Notes

- **Backup your code** before running the tool
- **Review changes** carefully before committing
- **Test thoroughly** after enhancement
- The tool modifies files in-place for easy PR creation
- Always validate that your application still works after enhancement

## 🛡️ Security Best Practices

This tool enforces these critical security patterns:

1. **UUID Validation**: All tokens and IDs use proper UUID format validation
2. **Input Sanitization**: Email normalization, string trimming, safe character patterns
3. **Array Limits**: Prevent DoS attacks with size limits and element validation
4. **Enum Enforcement**: Replace string validation with proper enum validation
5. **Injection Prevention**: Strict pattern matching for user inputs
6. **Transform Security**: Automatic sanitization of common input types

---

**Remember**: Security is not a one-time fix but an ongoing process. This tool helps establish a strong foundation, but always review and test your validation logic!
