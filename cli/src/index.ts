#!/usr/bin/env node
import inquirer from 'inquirer';
import shell from 'shelljs';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

// Improve error handling and logging
interface ModuleConfig {
    name: string;
    packageName: string;
    importStatement: string;
    moduleRegistration: string;
    envVars?: Record<string, string>;
}

async function main() {
    console.log(chalk.green('NewLink CLI Tool'));

    try {
        // Step 1: Project Name Input with Enhanced Validation
        const { projectName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Enter your project name:',
                validate: (input) => {
                    // More robust project name validation
                    const validNameRegex = /^[a-z0-9-_]+$/i;
                    if (!input) return 'Project name is required!';
                    if (!validNameRegex.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
                    return true;
                },
            },
        ]);

        const projectPath = path.resolve(process.cwd(), projectName);

        // Step 2: Create NestJS Project with Error Handling
        console.log(chalk.blue(`\nCreating NestJS project: ${projectName}...`));
        const createResult = shell.exec(`npx @nestjs/cli new ${projectName} --package-manager npm`);
        if (createResult.code !== 0) {
            throw new Error('Failed to create NestJS project.');
        }

        // Available Modules Configuration
        const availableModules: ModuleConfig[] = [
            {
                name: 'authentication',
                packageName: '@newlink/authentication',
                importStatement: `import { AuthenticationModule } from '@newlink/authentication';`,
                moduleRegistration: `AuthenticationModule.register(
          {
            authenticationField: 'phone',
            registrationFields: ['first_name', 'last_name', 'email', 'phone', 'password', 'username', 'address', 'pincode', 'gender'],
            roles: ['Admin', 'Editor', 'Viewer'],
            features: ['Create Post', 'Edit Post', 'View Post'],
            permissions: [
              {
                role: 'Admin',
                features: ['Create Post', 'Edit Post', 'View Post'],
              },
              {
                role: 'Editor',
                features: ['Edit Post', 'View Post'],
              },
              {
                role: 'Viewer',
                features: ['View Post'],
              },
            ],
          },
          {
            synchronize: true,
          }
        )`,
                envVars: {
                    JWT_SECRET: 'your_jwt_secret',
                    JWT_EXPIRATION: '1d',
                    DB_TYPE: 'postgres',
                    DB_HOST: 'localhost',
                    DB_PORT: '5432',
                    DB_USERNAME: 'postgres',
                    DB_PASSWORD: 'postgres',
                    DB_NAME: 'postgres',
                    DB_SYNCHRONIZE: 'true',
                },
            },
            {
                name: 'authorization',
                packageName: '@newlink/authorization',
                importStatement: `import { AuthorizationModule } from '@newlink/authorization';`,
                moduleRegistration: `AuthorizationModule.register()`,
                envVars: {
                    JWT_SECRET: 'your_jwt_secret',
                    JWT_EXPIRATION: '1d',
                },
            },
            {
                name: 'blockchain',
                packageName: '@newlink/blockchain',
                importStatement: `import { BlockchainModule } from '@newlink/blockchain';`,
                moduleRegistration: `BlockchainModule.register({})`,
                envVars: {
                    BLOCKCHAIN: 'hedera',
                    BLOCKCHAIN_NETWORK: 'testnet',
                    BLOCKCHAIN_ACCOUNT_ID: '0.0.12345',
                    BLOCKCHAIN_PRIVATE_KEY: 'your_private_key',
                },
            },
            {
                name: 'notification',
                packageName: '@newlink/notification',
                importStatement: `import { NotificationModule } from '@newlink/notification';`,
                moduleRegistration: `NotificationModule.register({})`,
                envVars: {
                    EMAIL_HOST: 'smtp.mailtrap.io',
                    EMAIL_PORT: '587',
                    EMAIL_USER: 'your_email',
                    EMAIL_PASS: 'your_password',
                    EMAIL_FROM: 'your_email',
                    PLIVO_AUTH_ID: 'plivo_auth_id',
                    PLIVO_AUTH_TOKEN: 'plivo_auth_token',
                    PLIVO_FROM_NUMBER: 'plivo_from_number',
                },
            },
        ];

        // Centralized Module Installation Function
        async function installModule(module: ModuleConfig): Promise<boolean> {
            console.log(chalk.blue(`\nInstalling ${module.packageName}...`));
            shell.cd(projectPath);

            // Enhanced installation with error handling
            try {
                // First, try npm link
                const linkResult = shell.exec(`npm link ${module.packageName}`, { silent: true });

                // If npm link fails, try alternative installation
                if (linkResult.code !== 0) {
                    console.warn(chalk.yellow(`npm link failed for ${module.packageName}. Trying alternative installation.`));
                    const installResult = shell.exec(`npm install ${module.packageName}`, { silent: true });

                    if (installResult.code !== 0) {
                        throw new Error(`Failed to install ${module.packageName}`);
                    }
                }

                return true;
            } catch (error) {
                console.error(chalk.red(`Error installing ${module.packageName}:`, error));
                return false;
            }
        }

        // Prompt and install modules dynamically
        const selectedModules: ModuleConfig[] = [];
        for (const module of availableModules) {
            const { selected } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'selected',
                    message: `Do you want to enable ${module.name}?`,
                    default: module.name === 'authentication', // Default authentication to true
                },
            ]);

            if (selected) {
                const installed = await installModule(module);
                if (installed) {
                    selectedModules.push(module);
                }
            }
        }

        // Modify App Module
        console.log(chalk.blue(`\nImplementing Changes to AppModule...`));

        const appModulePath = path.join(projectPath, 'src', 'app.module.ts');
        let appModuleContent = await fs.readFile(appModulePath, 'utf-8');

        const imports = selectedModules.map(module => module.importStatement);
        const moduleRegistrations = selectedModules.map(module => module.moduleRegistration);

        imports.unshift(`import { ConfigModule } from '@nestjs/config';`);
        moduleRegistrations.unshift(`ConfigModule.forRoot({ isGlobal: true })`);


        appModuleContent = appModuleContent.replace(
            `import { AppService } from './app.service';`,
            `import { AppService } from './app.service';\n${imports.join('\n')}`
        );

        appModuleContent = appModuleContent.replace(
            'imports: []',
            `imports: [\n${moduleRegistrations.join(', \n')}\n]`
        );

        await fs.writeFile(appModulePath, appModuleContent, 'utf-8');
        console.log(chalk.green('AppModule modified successfully.'));

        // Implement Swagger Module
        const mainPath = path.join(projectPath, 'src', 'main.ts');
        let mainContent = await fs.readFile(mainPath, 'utf-8');

        console.log(chalk.blue(`\nImplementing Swagger...`));

        shell.exec(`npm install @nestjs/swagger`, { silent: true });

        mainContent = mainContent.replace(`import { AppModule } from './app.module';`, `import { AppModule } from './app.module';\nimport { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';`);

        mainContent = mainContent.replace(`const app = await NestFactory.create(AppModule);`, `const app = await NestFactory.create(AppModule);\nconst config = new DocumentBuilder().setTitle('${projectName} API Doc').setDescription('The ${projectName} API description').setVersion('1.0').build();\nconst document = SwaggerModule.createDocument(app, config);\nSwaggerModule.setup('api', app, document);`)

        await fs.writeFile(mainPath, mainContent, 'utf-8');

        console.log(chalk.green('Swagger Implemented successfully.'));


        // Consolidated .env generation
        console.log(chalk.blue(`\nGenerating .env file...`));

        const envVars: Record<string, string> = {
            ...selectedModules.reduce((acc, module) => ({
                ...acc,
                ...(module.envVars || {})
            }), {})
        };

        const envPath = path.join(projectPath, '.env');
        const envContent = Object.entries(envVars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        await fs.writeFile(envPath, envContent, 'utf-8');
        console.log(chalk.green('.env file generated successfully.'));

        console.log(chalk.green(`\nNestJS project ${projectName} created successfully!`));

    } catch (error) {
        console.error(chalk.red('Critical Error:'), error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(chalk.red('Unhandled Error:'), error);
    process.exit(1);
});