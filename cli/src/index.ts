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
        packageName: '@newput-newlink/authentication',
        importStatement: `import { AuthenticationModule } from '@newput-newlink/authentication';`,
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
        packageName: '@newput-newlink/authorization',
        importStatement: `import { AuthorizationModule } from '@newput-newlink/authorization';`,
        moduleRegistration: `AuthorizationModule.register()`,
        envVars: {
            JWT_SECRET: 'your_jwt_secret',
            JWT_EXPIRATION: '1d',
        },
    },
    {
        name: 'blockchain',
        packageName: '@newput-newlink/blockchain',
        importStatement: `import { BlockchainModule } from '@newput-newlink/blockchain';`,
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
        packageName: '@newput-newlink/notification',
        importStatement: `import { NotificationModule } from '@newput-newlink/notification';`,
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

// ------------------------ UTILITY FUNCTIONS ------------------------

function runShellCommand(cmd: string, silent = true) {
    const result = shell.exec(cmd, { silent });
    if (result.code !== 0) {
        throw new Error(`Failed to run command: ${cmd}\n${result.stderr}`);
    }
    return result.stdout;
}

async function promptProjectName(prompt: string): Promise<string> {
    const { projectName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: prompt,
            validate: (input: string) => {
                const validNameRegex = /^[a-z0-9-_]+$/i;
                if (!input) return 'Project name is required!';
                if (!validNameRegex.test(input))
                    return 'Name can only contain letters, numbers, hyphens, and underscores.';
                return true;
            },
        },
    ]);
    return projectName;
}

async function promptSelectedModules(projectType: 'Monolithic' | 'Microservices'): Promise<ModuleConfig[]> {
    const promptMsg = projectType === 'Monolithic'
        ? 'Do you want to enable'
        : 'Do you want to create a microservice for';

    const selected: ModuleConfig[] = [];
    for (const module of availableModules) {
        const { confirmModule } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmModule',
                message: `${promptMsg} ${module.name}?`,
                default: module.name === 'authentication',  // default for auth
            },
        ]);
        if (confirmModule) selected.push(module);
    }

    if (selected.length === 0) {
        console.log(chalk.yellow('No modules selected. Exiting.'));
        process.exit(0);
    }
    return selected;
}

async function generateEnvFile(projectPath: string, envVars: Record<string, string>) {
    if (!envVars || Object.keys(envVars).length === 0) return;
    console.log(chalk.blue(`\nGenerating .env file...`));
    const envPath = path.join(projectPath, '.env');
    const content = Object.entries(envVars)
        .map(([key, val]) => `${key}=${val}`)
        .join('\n');
    await fs.writeFile(envPath, content, 'utf-8');
    console.log(chalk.green('.env file generated successfully.'));
}

async function modifyAppModule(projectPath: string, selectedModules: ModuleConfig[]) {
    console.log(chalk.blue(`\nImplementing Changes to AppModule...`));
    const appModulePath = path.join(projectPath, 'src', 'app.module.ts');
    if (!fs.existsSync(appModulePath)) {
        console.error(chalk.red(`app.module.ts not found at: ${appModulePath}`));
        return;
    }

    let appModuleContent = await fs.readFile(appModulePath, 'utf-8');

    const imports = selectedModules.map(m => m.importStatement);
    const registrations = selectedModules.map(m => m.moduleRegistration);

    // Insert ConfigModule at top of module list
    imports.unshift(`import { ConfigModule } from '@nestjs/config';`);
    registrations.unshift(`ConfigModule.forRoot({ isGlobal: true })`);

    appModuleContent = appModuleContent.replace(
        `import { AppService } from './app.service';`,
        `import { AppService } from './app.service';\n${imports.join('\n')}`
    );
    appModuleContent = appModuleContent.replace(
        'imports: []',
        `imports: [\n${registrations.join(',\n')}\n]`
    );

    await fs.writeFile(appModulePath, appModuleContent, 'utf-8');
    console.log(chalk.green('AppModule modified successfully.'));
}

async function implementSwagger(projectPath: string, projectName: string) {
    console.log(chalk.blue(`\nImplementing Swagger...`));
    runShellCommand(`npm install @nestjs/swagger`);
    const mainPath = path.join(projectPath, 'src', 'main.ts');
    if (!fs.existsSync(mainPath)) {
        console.error(chalk.red(`main.ts not found at: ${mainPath}`));
        return;
    }
    let mainContent = await fs.readFile(mainPath, 'utf-8');

    const importSnippet = `import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';`;
    if (!mainContent.includes(importSnippet)) {
        mainContent = mainContent.replace(
            `import { AppModule } from './app.module';`,
            `import { AppModule } from './app.module';\n${importSnippet}`
        );
    }

    const swaggerSnippet = `
    const config = new DocumentBuilder()
      .setTitle('${projectName} API Doc')
      .setDescription('The ${projectName} API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);`;

    if (!mainContent.includes(swaggerSnippet)) {
        mainContent = mainContent.replace(
            `const app = await NestFactory.create(AppModule);`,
            `const app = await NestFactory.create(AppModule);\n${swaggerSnippet}`
        );
    }

    await fs.writeFile(mainPath, mainContent, 'utf-8');
    console.log(chalk.green('Swagger Implemented successfully.'));
}

// ------------------------ MONOLITHIC ------------------------

async function Monolithic() {
    try {
        const projectName = await promptProjectName('Enter your project name:');
        const projectPath = path.resolve(process.cwd(), projectName);

        // Create NestJS Project
        console.log(chalk.blue(`\nCreating NestJS project: ${projectName}...`));
        runShellCommand(`npx @nestjs/cli new ${projectName} --package-manager npm`);
        console.log(chalk.green('NestJS project created successfully.'));

        // Prompt Modules
        const selectedModules = await promptSelectedModules('Monolithic');

        shell.cd(projectPath);
        // Install selected modules
        for (const module of selectedModules) {
            console.log(chalk.blue(`\nInstalling ${module.packageName}...`));
            runShellCommand(`npm install ${module.packageName}`);
            if (module.name === 'authentication') {
                runShellCommand('npm install pg --save');
            }
        }

        // Modify App Module
        await modifyAppModule(projectPath, selectedModules);

        // Swagger
        await implementSwagger(projectPath, projectName);

        // Consolidated .env
        const envVars = selectedModules.reduce<Record<string, string>>((acc, mod) => ({
            ...acc,
            ...(mod.envVars || {}),
        }), {});
        await generateEnvFile(projectPath, envVars);

        console.log(chalk.green(`\nNewput-newlink project '${projectName}' created successfully!`));
    } catch (error) {
        console.error(chalk.red('Critical Error:'), error);
        process.exit(0);
    }
}

// ------------------------ MICROSERVICES ------------------------

async function Microservices() {
    try {
        const baseProjectName = await promptProjectName('Enter your microservices base project name:');
        const rootPath = path.resolve(process.cwd(), baseProjectName);
        shell.mkdir('-p', rootPath);
        shell.cd(rootPath);

        // Initialize NPM project if none
        if (!fs.existsSync(path.join(rootPath, 'package.json'))) {
            runShellCommand('npm init -y');
        }

        // Lerna Setup
        console.log(chalk.blue(`\nCreating Lerna monorepo: ${baseProjectName}...`));
        runShellCommand('npm install --save-dev lerna');
        console.log(chalk.blue(`\nInitializing Lerna...`));
        runShellCommand('npx lerna init --exact');

        // Prompt for modules
        const selectedModules = await promptSelectedModules('Microservices');

        for (const module of selectedModules) {
            const serviceName = `${module.name}-service`;
            const servicePath = path.join(rootPath, serviceName);

            console.log(chalk.blue(`\nCreating microservice for ${module.name}...`));
            runShellCommand(`npx @nestjs/cli new ${serviceName} --package-manager npm `);
            console.log(chalk.green(`Microservice for ${module.name} created successfully.`));

            shell.cd(servicePath);
            // Install module
            // runShellCommand(`npm link ${module.packageName}`);
            runShellCommand(`npm install ${module.packageName}`);
            if (module.name === 'authentication') {
                runShellCommand('npm install pg --save');
            }

            // Modify app.module
            await modifyAppModule(servicePath, [module]);

            // Swagger
            await implementSwagger(servicePath, serviceName);

            // ENV
            const envVars = { ...(module.envVars || {}) };
            // Example tweak for DB hostname in Docker
            if (module.name === 'authentication')
                envVars.DB_HOST = 'database';
            await generateEnvFile(servicePath, envVars);

            // Dockerfile
            console.log(chalk.blue(`Creating Dockerfile for ${serviceName}...`));
            const dockerfileContent = `
FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]`;
            await fs.writeFile(path.join(servicePath, 'Dockerfile'), dockerfileContent.trim(), 'utf-8');
            console.log(chalk.green(`Dockerfile created for ${module.name}.`));
            shell.cd(rootPath);
        }

        // Docker Compose
        const composePath = path.join(rootPath, 'docker-compose.yml');
        let composeContent = `services:\n`;
        for (const mod of selectedModules) {
            const serviceName = `${mod.name}-service`;
            composeContent += `  ${serviceName}:
    build: ./${serviceName}
    container_name: ${serviceName}
    ports:
      - "3${Math.floor(Math.random() * 900 + 100)}:3000"
    env_file:
      - ./${serviceName}/.env
    depends_on:
      - database
`;
        }
        composeContent += `
  database:
    image: postgres
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
`;
        await fs.writeFile(composePath, composeContent.trim(), 'utf-8');

        // Install & Link
        shell.cd(rootPath);
        console.log(chalk.blue(`\nInstalling dependencies via npm at root...`));
        try {
            runShellCommand('npm install', true);
        } catch {
            console.warn(chalk.yellow(`npm install encountered errors. Please review manually.`));
        }

        console.log(chalk.green('\nMicroservices setup completed successfully!'));
        console.log(chalk.green(`\nNavigate to '${baseProjectName}' and explore your microservices in project directory.`));

    } catch (error) {
        console.error(chalk.red('Critical Error:'), error);
        process.exit(0);
    }
}

// ------------------------ MAIN ------------------------

async function main() {
    console.log(chalk.blue('Welcome to the Newput-newlink CLI!'));
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
    } else {
        await Microservices();
    }
}
main().catch((error) => {
    console.error(chalk.red('Unhandled Error:'), error);
    process.exit(0);
});