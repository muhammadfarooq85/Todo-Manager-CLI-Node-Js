const fs = require('fs');
const chalk = require('chalk').default;
const inquirer = require('inquirer').default;
const ora = require("ora").default;

const FILE = 'todo.json';

function loadTasks() {
    if (!fs.existsSync(FILE)) return [];
    const data = fs.readFileSync(FILE);
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));
}

async function addTask() {
    const { task } = await inquirer.prompt([
        {
            type: 'input',
            name: 'task',
            message: 'Enter your task:',
            validate: input => input ? true : 'Task cannot be empty!'
        }
    ]);

    const tasks = loadTasks();
    const spinner = ora(`Saving your task...`).start();
    tasks.push({ id: Date.now(), task, completed: false });
    saveTasks(tasks);
    await new Promise(resolve => setTimeout(resolve, 3000)); // wait here properly
    spinner.succeed(chalk.green("Your task has been added successfully!"));
}

async function listTasks() {
    const spinner = ora('Fetching your tasks...').start();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
    spinner.stop();

    const tasks = loadTasks();
    if (tasks.length === 0) {
        console.log(chalk.red('No tasks found!'));
    } else {
        console.log(chalk.blue.bold('\nYour Tasks:\n'));
        tasks.forEach((t, index) => {
            const status = t.completed ? chalk.green('✓ Completed') : chalk.red('✗ Incomplete');
            console.log(`${index + 1}. ${t.task} - ${status}`);
        });
    }
}

async function deleteTask() {
    const tasks = loadTasks();
    if (tasks.length === 0) {
        return console.log(chalk.red('No tasks to delete.'));
    }

    const { index } = await inquirer.prompt([
        {
            type: 'list',
            name: 'index',
            message: 'Select a task to delete:',
            choices: tasks.map((t, i) => ({
                name: `${t.task} (${t.completed ? '✓' : '✗'})`,
                value: i
            }))
        }
    ]);

    const spinner = ora('Deleting your task...').start();
    await new Promise(resolve => setTimeout(resolve, 3000));
    tasks.splice(index, 1);
    saveTasks(tasks);
    spinner.succeed(chalk.green('Task deleted successfully!'));
}

async function main() {
    try {
        const { name } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is your name?',
                validate: input => input ? true : "Please provide name."
            }
        ]);

        console.log(chalk.cyan(`\nWelcome, ${name}\n! Have a nice day.`));

        let exit = false;
        while (!exit) {
            const { choice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: 'What would you like to do?',
                    choices: [
                        { name: '1. Add a Task', value: 'add' },
                        { name: '2. View Tasks', value: 'list' },
                        { name: '3. Delete a Task', value: 'delete' },
                        { name: '4. Exit', value: 'exit' }
                    ]
                }
            ]);

            switch (choice) {
                case 'add':
                    await addTask();
                    break;
                case 'list':
                    await listTasks();
                    break;
                case 'delete':
                    await deleteTask();
                    break;
                case 'exit':
                    const spinner = ora('Exiting...').start();
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    spinner.succeed(chalk.yellow('Goodbye!'));
                    exit = true;
                    break;
            }
        }
    } catch (err) {
        if (err.name === 'ExitPromptError') {
            console.log(chalk.red('\nPrompt closed by user. Exiting gracefully...'));
            // Do NOT call process.exit(1) here!
            return;
        } else {
            console.error(chalk.red('An unexpected error occurred:\n'), err);
            process.exit(1);
        }
    }
}

main();