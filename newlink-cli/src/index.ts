#!/usr/bin/env node
import inquirer from 'inquirer';
import shell from 'shelljs';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

async function main() {
    console.log(chalk.green('NewLink CLI Tool'));
    let command: string = 'npm ';
    let imports: string[] = [`import { ConfigModule } from '@nestjs/config';`];
    let modules: string[] = ['ConfigModule.forRoot({ isGlobal: true })'];

    const envVars: Record<string, string> = {};

    // Step 1: Ask for Project Name
    const { projectName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter your project name:',
            validate: (input) => !!input || 'Project name is required!',
        },
    ]);

    const projectPath = path.resolve(process.cwd(), projectName);

    // Step 2: Create NestJS Project
    console.log(chalk.blue(`\nCreating NestJS project: ${projectName}...`));
    if (shell.exec(`npx @nestjs/cli new ${projectName} --package-manager npm`).code !== 0) {
        console.log(chalk.red('Error: Failed to create NestJS project.'));
        shell.exit(1);
    }

    // Step 4: Install @newlink/authentication
    const { authentication } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'authentication',
            message: 'Do you want to enable authentication?',
            default: true,
        },
    ]);

    if (authentication) {
        console.log(chalk.blue('\nInstalling @newlink/authentication...'));
        shell.cd(projectPath);

        // command = 'npm install @newlink/authentication';
        // command = 'npm link @newlink/authentication && npm install @newlink/authentication';
        command = 'npm link @newlink/authentication'

        if (shell.exec(command).code !== 0) {
            console.log(chalk.red('Error: Failed to install @newlink/authentication.'));
            shell.exit(1);
        }
        else {
            imports.push(`import { AuthenticationModule } from '@newlink/authentication';`);
            modules.push(`AuthenticationModule.register(
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
    )`);
            console.log(chalk.green('Added Authentication to app.module.ts'));
        }
    }

    else {
        const { authorization } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'authorization',
                message: 'Do you want to enable authorization?',
                default: true,
            },
        ]);

        if (authorization) {
            console.log(chalk.blue('\nInstalling @newlink/authorization...'));
            shell.cd(projectPath);
            // command = 'npm install @newlink/authorization';
            // command = 'npm link @newlink/authorization && npm install @newlink/authorization';
            command = 'npm link @newlink/authorization'

            if (shell.exec(command).code !== 0) {
                console.log(chalk.red('Error: Failed to install @newlink/authorization.'));
                shell.exit(1);
            }
            else {
                imports.push(`import { AuthorizationModule } from '@newlink/authorization';`);
                modules.push(`AuthorizationModule.register()`);
                console.log(chalk.green('Added Authorization to app.module.ts'));
            }
        }
    }

    // Step 5: Install @newlink/blockchain
    const { blockchain } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'blockchain',
            message: 'Do you want to enable blockchain?',
            default: false,
        },
    ]);

    if (blockchain) {
        console.log(chalk.blue('\nInstalling @newlink/blockchain...'));
        shell.cd(projectPath);
        // command = 'npm install @newlink/blockchain';
        command = 'npm link @newlink/blockchain && npm install @newlink/blockchain';
        command = 'npm link @newlink/blockchain'

        if (shell.exec(command).code !== 0) {
            console.log(chalk.red('Error: Failed to install @newlink/blockchain.'));
            shell.exit(1);
        }
        else {
            imports.push(`import { BlockchainModule } from '@newlink/blockchain';`);
            modules.push(`BlockchainModule.register({})`);
            console.log(chalk.green('Added Blockchain to app.module.ts'));
        }
    }

    // Step 6: Install @newlink/notification
    const { notification } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'notification',
            message: 'Do you want to enable notification?',
            default: false,
        },
    ]);

    if (notification) {
        console.log(chalk.blue('\nInstalling @newlink/notification...'));
        shell.cd(projectPath);
        // command = 'npm install @newlink/notification';
        command = 'npm link @newlink/notification && npm install @newlink/notification';
        command = 'npm link @newlink/notification'

        if (shell.exec(command).code !== 0) {
            console.log(chalk.red('Error: Failed to install @newlink/notification.'));
            shell.exit(1);
        }
        else {
            imports.push(`import { NotificationModule } from '@newlink/notification';`);
            modules.push(`NotificationModule.register({})`);
            console.log(chalk.green('Added Notification to app.module.ts'));
        }
    }

    // Step 3: Install Additional Dependencies
    console.log(chalk.blue('\nInstalling additional dependencies...'));
    shell.cd(projectPath);
    if (shell.exec('npm install').code !== 0) {
        console.log(chalk.red('Error: Failed to install dependencies.'));
        shell.exit(1);
    }

    // Step 4: Modify AppModule
    console.log(chalk.blue('\nModifying AppModule...'));
    const appModulePath = path.join(projectPath, 'src', 'app.module.ts');
    try {
        let appModuleContent = await fs.readFile(appModulePath, 'utf-8');
        appModuleContent = imports.join('\n') + '\n' + appModuleContent;

        appModuleContent = appModuleContent.replace(
            'imports: []',
            `imports: [\n${modules.join(', \n')}\n]`
        );
        await fs.writeFile(appModulePath, appModuleContent, 'utf-8');
        console.log(chalk.green('AppModule modified successfully.'));
    } catch (error) {
        console.log(chalk.red('Error modifying AppModule:'), error);
        shell.exit(1);
    }

    // Step 5: Generate .env File
    console.log(chalk.blue('\nGenerating .env file...'));
    const envPath = path.join(projectPath, '.env');
    const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    try {
        await fs.writeFile(envPath, envContent, 'utf-8');
        console.log(chalk.green('.env file generated successfully.'));
    } catch (error) {
        console.log(chalk.red('Error generating .env file:'), error);
        shell.exit(1);
    }

    // Step 6: Done
    console.log(chalk.green(`\nNestJS project ${projectName} created successfully!`));
}

main().catch((error) => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
});