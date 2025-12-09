#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to generate test files from templates
 * 
 * Usage:
 * node scripts/generate-tests.js <feature-name> [options]
 * 
 * Options:
 * --ui-only: Generate only UI tests
 * --api-only: Generate only API tests
 * --page-only: Generate only Page Object
 * --all: Generate all files (default)
 * 
 * Examples:
 * node scripts/generate-tests.js booking
 * node scripts/generate-tests.js user-management --ui-only
 * node scripts/generate-tests.js apartment --all
 */

class TestGenerator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.templatesDir = path.join(this.projectRoot, 'tests', 'templates');
        this.outputDirs = {
            pages: path.join(this.projectRoot, 'tests', 'pages'),
            uiTests: path.join(this.projectRoot, 'tests', 'e2e'),
            apiTests: path.join(this.projectRoot, 'tests', 'e2e', 'api')
        };
    }

    // Utility methods
    toPascalCase(str) {
        return str
            .split(/[-_\s]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    toCamelCase(str) {
        const pascal = this.toPascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    }

    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
            .replace(/[_\s]/g, '-');
    }

    toSnakeCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase()
            .replace(/[-\s]/g, '_');
    }

    // Template replacement
    replaceTemplateVariables(content, featureName) {
        const pascalCase = this.toPascalCase(featureName);
        const camelCase = this.toCamelCase(featureName);
        const kebabCase = this.toKebabCase(featureName);
        const snakeCase = this.toSnakeCase(featureName);

        return content
            .replace(/\[FEATURE_NAME\]/g, pascalCase)
            .replace(/\[featureName\]/g, camelCase)
            .replace(/\[feature-name\]/g, kebabCase)
            .replace(/\[feature_name\]/g, snakeCase)
            .replace(/\[RESOURCE\]/g, pascalCase)
            .replace(/\[resource\]/g, camelCase)
            .replace(/\[RESOURCES\]/g, pascalCase + 's')
            .replace(/\[resources\]/g, camelCase + 's')
            .replace(/\[ENDPOINT\]/g, kebabCase)
            .replace(/\[endpoint\]/g, kebabCase)
            .replace(/\[feature-path\]/g, kebabCase)
            .replace(/\[feature-endpoint\]/g, kebabCase);
    }

    // File generation methods
    generatePageObject(featureName) {
        console.log(`📄 Generating Page Object for ${featureName}...`);

        const templatePath = path.join(this.templatesDir, 'page-object.template.js');
        const outputPath = path.join(this.outputDirs.pages, `${this.toPascalCase(featureName)}Page.js`);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const generatedContent = this.replaceTemplateVariables(templateContent, featureName);

        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        if (fs.existsSync(outputPath)) {
            console.log(`⚠️  File already exists: ${outputPath}`);
            console.log('   Use --force to overwrite');
            return false;
        }

        fs.writeFileSync(outputPath, generatedContent);
        console.log(`✅ Created: ${outputPath}`);
        return true;
    }

    generateUITests(featureName) {
        console.log(`🖥️  Generating UI tests for ${featureName}...`);

        const templatePath = path.join(this.templatesDir, 'ui-test.template.js');
        const featureDir = path.join(this.outputDirs.uiTests, this.toKebabCase(featureName));
        const outputPath = path.join(featureDir, `${this.toKebabCase(featureName)}.spec.js`);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const generatedContent = this.replaceTemplateVariables(templateContent, featureName);

        // Ensure output directory exists
        fs.mkdirSync(featureDir, { recursive: true });

        if (fs.existsSync(outputPath)) {
            console.log(`⚠️  File already exists: ${outputPath}`);
            console.log('   Use --force to overwrite');
            return false;
        }

        fs.writeFileSync(outputPath, generatedContent);
        console.log(`✅ Created: ${outputPath}`);
        return true;
    }

    generateAPITests(featureName) {
        console.log(`🔌 Generating API tests for ${featureName}...`);

        const templatePath = path.join(this.templatesDir, 'api-test.template.js');
        const outputPath = path.join(this.outputDirs.apiTests, `${this.toKebabCase(featureName)}.api.spec.js`);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const generatedContent = this.replaceTemplateVariables(templateContent, featureName);

        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        if (fs.existsSync(outputPath)) {
            console.log(`⚠️  File already exists: ${outputPath}`);
            console.log('   Use --force to overwrite');
            return false;
        }

        fs.writeFileSync(outputPath, generatedContent);
        console.log(`✅ Created: ${outputPath}`);
        return true;
    }

    updateApiHelper(featureName) {
        console.log(`🔧 Updating API Helper for ${featureName}...`);

        const apiHelperPath = path.join(this.projectRoot, 'tests', 'utils', 'api.helper.js');

        if (!fs.existsSync(apiHelperPath)) {
            console.log(`⚠️  API Helper not found: ${apiHelperPath}`);
            return false;
        }

        const pascalCase = this.toPascalCase(featureName);
        const camelCase = this.toCamelCase(featureName);
        const kebabCase = this.toKebabCase(featureName);

        const methodsToAdd = `
  // ${pascalCase} API methods
  async create${pascalCase}(${camelCase}Data) {
    try {
      const apiContext = await this.createApiContext();
      
      const response = await apiContext.post('/${kebabCase}', {
        data: ${camelCase}Data
      });

      if (response.ok()) {
        const data = await response.json();
        console.log(\`✅ ${pascalCase} created: \${data.name || data.id}\`);
        return data;
      } else {
        const error = await response.text();
        throw new Error(\`Failed to create ${camelCase}: \${response.status()} - \${error}\`);
      }
    } catch (error) {
      console.error('❌ Failed to create ${camelCase}:', error);
      throw error;
    }
  }

  async get${pascalCase}s(params = {}) {
    try {
      const apiContext = await this.createApiContext();
      
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? \`/${kebabCase}?\${queryString}\` : '/${kebabCase}';
      
      const response = await apiContext.get(url);

      if (response.ok()) {
        return await response.json();
      } else {
        throw new Error(\`Failed to get ${camelCase}s: \${response.status()}\`);
      }
    } catch (error) {
      console.error('❌ Failed to get ${camelCase}s:', error);
      throw error;
    }
  }

  async get${pascalCase}ById(id) {
    try {
      const apiContext = await this.createApiContext();
      
      const response = await apiContext.get(\`/${kebabCase}/\${id}\`);

      if (response.ok()) {
        return await response.json();
      } else {
        throw new Error(\`Failed to get ${camelCase}: \${response.status()}\`);
      }
    } catch (error) {
      console.error('❌ Failed to get ${camelCase}:', error);
      throw error;
    }
  }

  async update${pascalCase}(id, ${camelCase}Data) {
    try {
      const apiContext = await this.createApiContext();
      
      const response = await apiContext.put(\`/${kebabCase}/\${id}\`, {
        data: ${camelCase}Data
      });

      if (response.ok()) {
        const data = await response.json();
        console.log(\`✅ ${pascalCase} updated: \${data.name || data.id}\`);
        return data;
      } else {
        const error = await response.text();
        throw new Error(\`Failed to update ${camelCase}: \${response.status()} - \${error}\`);
      }
    } catch (error) {
      console.error('❌ Failed to update ${camelCase}:', error);
      throw error;
    }
  }

  async delete${pascalCase}(id) {
    try {
      const apiContext = await this.createApiContext();
      
      const response = await apiContext.delete(\`/${kebabCase}/\${id}\`);

      if (response.ok()) {
        console.log(\`✅ ${pascalCase} deleted: \${id}\`);
        return true;
      } else {
        throw new Error(\`Failed to delete ${camelCase}: \${response.status()}\`);
      }
    } catch (error) {
      console.error('❌ Failed to delete ${camelCase}:', error);
      throw error;
    }
  }
`;

        let apiHelperContent = fs.readFileSync(apiHelperPath, 'utf8');

        // Check if methods already exist
        if (apiHelperContent.includes(`create${pascalCase}`)) {
            console.log(`⚠️  ${pascalCase} methods already exist in API Helper`);
            return false;
        }

        // Add methods before the closing brace of the class
        const insertPosition = apiHelperContent.lastIndexOf('}');
        apiHelperContent = apiHelperContent.slice(0, insertPosition) + methodsToAdd + '\n}';

        fs.writeFileSync(apiHelperPath, apiHelperContent);
        console.log(`✅ Updated API Helper with ${pascalCase} methods`);
        return true;
    }

    updatePackageJson(featureName) {
        console.log(`📦 Updating package.json scripts for ${featureName}...`);

        const packageJsonPath = path.join(this.projectRoot, 'package.json');

        if (!fs.existsSync(packageJsonPath)) {
            console.log(`⚠️  package.json not found: ${packageJsonPath}`);
            return false;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const kebabCase = this.toKebabCase(featureName);

        const newScripts = {
            [`test:${kebabCase}`]: `playwright test tests/e2e/${kebabCase}/`,
            [`test:${kebabCase}:api`]: `playwright test tests/e2e/api/${kebabCase}.api.spec.js`
        };

        // Add new scripts
        Object.assign(packageJson.scripts, newScripts);

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Added test scripts for ${featureName}`);
        return true;
    }

    generateAll(featureName, options = {}) {
        console.log(`🚀 Generating test files for feature: ${featureName}\n`);

        const results = {
            pageObject: false,
            uiTests: false,
            apiTests: false,
            apiHelper: false,
            packageJson: false
        };

        try {
            if (options.all || options.pageOnly || (!options.uiOnly && !options.apiOnly)) {
                results.pageObject = this.generatePageObject(featureName);
            }

            if (options.all || options.uiOnly || (!options.pageOnly && !options.apiOnly)) {
                results.uiTests = this.generateUITests(featureName);
            }

            if (options.all || options.apiOnly || (!options.pageOnly && !options.uiOnly)) {
                results.apiTests = this.generateAPITests(featureName);
                results.apiHelper = this.updateApiHelper(featureName);
            }

            if (options.all || (!options.pageOnly && !options.uiOnly && !options.apiOnly)) {
                results.packageJson = this.updatePackageJson(featureName);
            }

            console.log('\n📊 Generation Summary:');
            console.log('=====================');
            Object.entries(results).forEach(([key, success]) => {
                const status = success ? '✅' : '❌';
                console.log(`${status} ${key}: ${success ? 'Generated' : 'Skipped/Failed'}`);
            });

            console.log('\n🎯 Next Steps:');
            console.log('==============');
            console.log('1. Review generated files and update selectors');
            console.log('2. Implement feature-specific test logic');
            console.log('3. Update test data and assertions');
            console.log('4. Run tests to verify functionality');
            console.log(`5. Execute: npm run test:${this.toKebabCase(featureName)}`);

        } catch (error) {
            console.error('❌ Generation failed:', error.message);
            process.exit(1);
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
🧪 Test Generator for Playwright Automation

Usage: node scripts/generate-tests.js <feature-name> [options]

Arguments:
  feature-name    Name of the feature (e.g., 'booking', 'user-management')

Options:
  --ui-only      Generate only UI tests and Page Object
  --api-only     Generate only API tests and update API Helper
  --page-only    Generate only Page Object Model
  --all          Generate all files (default)
  --force        Overwrite existing files
  --help, -h     Show this help message

Examples:
  node scripts/generate-tests.js booking
  node scripts/generate-tests.js user-management --ui-only
  node scripts/generate-tests.js apartment --api-only
  node scripts/generate-tests.js payment --all

Generated Files:
  📄 Page Object: tests/pages/FeatureNamePage.js
  🖥️  UI Tests: tests/e2e/feature-name/feature-name.spec.js
  🔌 API Tests: tests/e2e/api/feature-name.api.spec.js
  🔧 API Helper: Updated with new methods
  📦 Package.json: Updated with new test scripts
`);
        process.exit(0);
    }

    const featureName = args[0];
    const options = {
        all: args.includes('--all'),
        uiOnly: args.includes('--ui-only'),
        apiOnly: args.includes('--api-only'),
        pageOnly: args.includes('--page-only'),
        force: args.includes('--force')
    };

    // Default to all if no specific option is provided
    if (!options.uiOnly && !options.apiOnly && !options.pageOnly) {
        options.all = true;
    }

    const generator = new TestGenerator();
    generator.generateAll(featureName, options);
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { TestGenerator };
