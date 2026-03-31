# Beginner Project: Simple Task Manager (Python)

This is a small command-line app that helps you track your to-do tasks.

It is made for beginners, so the code is short and heavily commented.
You can read the code and learn how a real (but simple) program works.

## What this app can do

- Show all tasks
- Add a new task
- Mark a task as done
- Delete a task
- Save tasks so they are still there next time

## What you need first

You need **Python 3** installed on your computer.

How to check:

1. Open your terminal.
2. Run:

```bash
python3 --version
```

If you see a version number (example: `Python 3.11.2`), you are ready.

---

## Step-by-step: run the project

### 1) Go to this project folder

In the terminal, move to the folder where `app.py` is saved.

### 2) Run the app

```bash
python3 app.py
```

### 3) Use the menu

You will see options 1 to 5.
Type a number and press Enter.

Example:
- Type `2` to add a task
- Type `1` to see tasks
- Type `3` to mark one done
- Type `4` to delete one
- Type `5` to quit

---

## Where your tasks are stored

The app creates a file called `tasks.json` in the same folder.
That file stores your tasks.

You can open `tasks.json` in a text editor to see saved data.

---

## Beginner learning notes

If you are new to coding, try this:

1. Read `app.py` from top to bottom.
2. Find a function (like `add_task`) and explain it in your own words.
3. Change one print message and run again.
4. Add your own menu option (challenge idea: "clear all done tasks").

---

## Troubleshooting

### "python3: command not found"

Python is not installed (or not in your PATH). Install Python 3, then try again.

### I closed the app and lost my tasks

Check whether `tasks.json` exists in the same folder as `app.py`.

### I typed letters when it asked for a number

That is okay. The app handles this and asks again from the menu.
