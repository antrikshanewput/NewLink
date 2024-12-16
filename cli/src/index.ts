#!/usr/bin/env node
import inquirer from 'inquirer';
import shell from 'shelljs';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

interface ModuleConfig {
    name: string;
    packageName: string;
    importStatement: string;
    moduleRegistration: string;
    envVars?: Record<string, string>;
}

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

async function projectNameInput(prompt: string): Promise<{ projectName: string }> {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: prompt,
            validate: (input) => {
                const validNameRegex = /^[a-z0-9-_]+$/i;
                if (!input) return 'Project name is required!';
                if (!validNameRegex.test(input))
                    return 'Name can only contain letters, numbers, hyphens, and underscores.';
                return true;
            },
        },
    ]);
}

async function createNestJSProject(projectName: string) {
    console.log(chalk.blue(`\nCreating NestJS project: ${projectName}...`));
    const createResult = shell.exec(`npx @nestjs/cli new ${projectName} --package-manager npm`, { silent: true });
    if (createResult.code !== 0) {
        throw new Error('Failed to create NestJS project.');
    }
    console.log(chalk.green('NestJS project created successfully.'));
}

async function installModule(module: ModuleConfig): Promise<boolean> {
    console.log(chalk.blue(`\nInstalling ${module.packageName}...`));
    try {
        const linkResult = shell.exec(`npm link ${module.packageName}`, { silent: true });
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

async function generateEnvFile(projectPath: string, envVars: Record<string, string>) {
    console.log(chalk.blue(`\nGenerating .env file...`));
    const envPath = path.join(projectPath, '.env');
    const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    await fs.writeFile(envPath, envContent, 'utf-8');
    console.log(chalk.green('.env file generated successfully.'));
}


async function modifyAppModule(projectPath: string, selectedModules: ModuleConfig[]) {
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
}

async function swaggerImplementation(projectPath: string, projectName: string) {
    console.log(chalk.blue(`\nImplementing Swagger...`));
    shell.exec(`npm install @nestjs/swagger`, { silent: true });

    const mainPath = path.join(projectPath, 'src', 'main.ts');
    let mainContent = await fs.readFile(mainPath, 'utf-8');

    mainContent = mainContent.replace(`import { AppModule } from './app.module';`, `import { AppModule } from './app.module';\nimport { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';`);
    mainContent = mainContent.replace(`const app = await NestFactory.create(AppModule);`, `const app = await NestFactory.create(AppModule);\nconst config = new DocumentBuilder().setTitle('${projectName} API Doc').setDescription('The ${projectName} API description').setVersion('1.0').build();\nconst document = SwaggerModule.createDocument(app, config);\nSwaggerModule.setup('api', app, document);`)

    await fs.writeFile(mainPath, mainContent, 'utf-8');
    console.log(chalk.green('Swagger Implemented successfully.'));
}

async function getSelectedModules(projectType: 'Monolithic' | 'Microservices'): Promise<ModuleConfig[]> {
    const prompt = projectType === 'Monolithic'
        ? 'Do you want to enable'
        : 'Do you want to create a microservice for';

    const selectedModules: ModuleConfig[] = [];
    for (const module of availableModules) {
        const { selected } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'selected',
                message: `${prompt} ${module.name}?`,
                default: module.name === 'authentication',
            },
        ]);

        if (selected) {
            selectedModules.push(module);
        }
    }

    if (selectedModules.length === 0) {
        console.log(chalk.yellow('No modules selected. Exiting.'));
        process.exit(0);
    }
    return selectedModules;
}

async function Monolithic() {

    try {
        // Step 1: Project Name Input with Enhanced Validation
        const { projectName } = await projectNameInput('Enter your project name:');
        const projectPath = path.resolve(process.cwd(), projectName);

        // Step 2: Create NestJS Project with Error Handling
        await createNestJSProject(projectName);

        // Prompt and install modules dynamically
        const selectedModules: ModuleConfig[] = await getSelectedModules('Monolithic');
        shell.cd(projectPath);
        for (const module of selectedModules)
            await installModule(module);

        // Modify App Module
        await modifyAppModule(projectPath, selectedModules);

        // Implement Swagger Module
        await swaggerImplementation(projectPath, projectName);

        // Consolidated .env generation
        const envVars: Record<string, string> = {
            ...selectedModules.reduce((acc, module) => ({
                ...acc,
                ...(module.envVars || {})
            }), {})
        };
        generateEnvFile(projectPath, envVars);
        console.log(chalk.green(`\nNewlink project ${projectName} created successfully!`));
    } catch (error) {
        console.error(chalk.red('Critical Error:'), error);
        process.exit(0);
    }
}



async function Microservices() {
    try {
        // Step 1: Base Project Name
        const { projectName } = await projectNameInput('Enter your microservices base project name:');

        // Step 2: Create Lerna Monorepo
        console.log(chalk.blue(`\nCreating Lerna monorepo: ${projectName}...`));
        const rootPath = path.resolve(process.cwd(), projectName);
        shell.mkdir('-p', rootPath);
        shell.cd(rootPath);

        // Initialize a new npm project if none exists
        if (!shell.test('-e', 'package.json')) {
            shell.exec('npm init -y');
        }

        // Install lerna globally (if not installed, or do local usage via npx)
        const installLerna = shell.exec('npm install --save-dev lerna', { silent: true });
        if (installLerna.code !== 0) {
            throw new Error('Failed to install Lerna locally.');
        }
        console.log(chalk.blue(`\nInitializing Lerna...`));
        let lernaInit = shell.exec(`npx lerna init --exact`, { silent: true });
        if (lernaInit.code !== 0) {
            throw new Error('Failed to initialize Lerna monorepo.');
        }

        // Step 3: Prompt user for which modules to enable
        const selectedModules: ModuleConfig[] = await getSelectedModules('Microservices');
        // Step 4: For each selected module, create a NestJS project in packages/
        shell.mkdir('-p', path.join(rootPath, 'packages'));
        for (const module of selectedModules) {
            const serviceName = `${module.name}-service`;
            const servicePath = path.join(rootPath, 'packages', serviceName);

            // Generate NestJS project for each microservice
            console.log(chalk.blue(`\nCreating microservice for ${module.name} ...`));

            shell.cd(path.join(rootPath, 'packages'));


            const createResult = shell.exec(`npx @nestjs/cli new ${serviceName} --package-manager npm --directory /packages/${serviceName}`, { silent: true });
            if (createResult.code !== 0) {
                throw new Error(`Failed to create NestJS microservice project for ${module.name}.`);
            }
            console.log(chalk.green(`Microservice for ${module.name} created successfully.`));

            // Step 5A: Install the respective @newlink package
            shell.cd(servicePath);
            await installModule(module);

            // Step 5B: Modify app.module.ts to import the microservice’s module
            await modifyAppModule(servicePath, [module]);

            // Implement Swagger Module
            await swaggerImplementation(servicePath, serviceName);

            // Step 5C: Create a dedicated .env for each microservice
            generateEnvFile(servicePath, module.envVars || {});

            // Step 5D: Add a Dockerfile for each microservice
            console.log(chalk.blue(`Creating Dockerfile for ${serviceName} ...`));
            const dockerfileContent = `
            # Base image
            FROM node:latest

            WORKDIR /usr/src/app

            # Copy package.json and install dependencies
            COPY package*.json ./
            RUN npm install

            # Copy source code
            COPY . .

            # Build the NestJS app
            RUN npm run build

            EXPOSE 3000
            CMD ["npm", "run", "start:prod"]
            `;
            const dockerfilePath = path.join(servicePath, 'Dockerfile');
            await fs.writeFile(dockerfilePath, dockerfileContent, 'utf-8');
            console.log(chalk.green(`Microservice for ${module.name} created successfully.`));
        }

        // Step 6: (Optional) Create a root-level Docker Compose file if you want to orchestrate everything
        const composePath = path.join(rootPath, 'docker-compose.yml');
        let composeContent = `services:
        `;
        for (const module of selectedModules) {
            const serviceName = `${module.name}-service`;
            composeContent += `
            ${serviceName}:
                build: ./packages/${serviceName}
                container_name: ${serviceName}
                ports:
                - "3${Math.floor(Math.random() * 90 + 10)}:3000"
                env_file:
                - ./packages/${serviceName}/.env
            `;
        }
        await fs.writeFile(composePath, composeContent, 'utf-8');

        // Step 7: Automatically install and link all workspace packages. (if needed)
        shell.cd(rootPath);
        console.log(chalk.blue(`\nInstalling dependencies via npm...`));
        const npmInstallResult = shell.exec(`npm install`, { silent: true });
        if (npmInstallResult.code !== 0) {
            console.warn(chalk.yellow(`npm install encountered errors. You may need to fix them manually.`));
        }

        console.log(chalk.green('\nMicroservices setup completed successfully!'));
        console.log(chalk.green(`\nYou can now navigate to ${projectName} folder and explore your microservices in packages/ directory.`));

    } catch (error) {
        console.error(chalk.red('Critical Error:'), error);
        process.exit(0);
    }
}

async function main() {
    console.log(chalk.blue('Welcome to the NewLink CLI!'));
    const { projectType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectType',
            message: 'Select project type:',
            choices: ['Monolithic', 'Microservices'],
        },
    ]);

    if (projectType === 'Monolithic') {
        await Monolithic();
    } else if (projectType === 'Microservices') {
        await Microservices();
    }
    // shell.exec(`curl ASCII.live/can-you-hear-me`);
}
main().catch((error) => {
    console.error(chalk.red('Unhandled Error:'), error);
    process.exit(0);
});