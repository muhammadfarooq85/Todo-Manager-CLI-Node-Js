#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const chalk = require('chalk').default;

const FILE = 'todo.json';

function loadTasks() {
    if (!fs.existsSync(FILE)) return [];
    const data = fs.readFileSync(FILE);
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));
}

program
    .command('add <task>')
    .description('Add a new task')
    .action((task) => {
        if (!task) {
            return console.log(chalk.red("Task is missing. Please provide the task in single or double quotes!"));
        }
        const tasks = loadTasks();
        tasks.push({ id: Date.now(), task, completed: false });
        saveTasks(tasks);
        console.log(chalk.green('Your task is added successfully!'));
    });


program
    .command('list')
    .description('List all tasks')
    .action(() => {
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
    });

program.parse(process.argv);
