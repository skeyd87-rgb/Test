"""
Simple Task Manager (Beginner Friendly)

This program helps you keep track of tasks from the command line.
It stores your tasks in a local file called tasks.json so your list
is still there the next time you run the program.

Why this is useful:
- You can quickly write down tasks.
- You can mark tasks as done.
- You can remove tasks you no longer need.

This file is intentionally full of comments so a beginner can learn
by reading it slowly, top to bottom.
"""

# We use json to save Python data (lists/dictionaries) into a file.
import json

# We use os only to check whether a file exists.
import os


# This is the filename where tasks are saved.
# If this file does not exist yet, the program will create it automatically.
TASK_FILE = "tasks.json"


def load_tasks():
    """
    Load tasks from tasks.json.

    Returns:
        list[dict]: A list of task dictionaries.

    What happens here:
    1) If the file does not exist, return an empty list.
    2) If the file exists, read it and convert JSON text into Python data.
    3) If anything is wrong with the file format, return an empty list.
    """
    if not os.path.exists(TASK_FILE):
        return []

    try:
        with open(TASK_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        # If the file is broken or unreadable, we avoid crashing.
        # Returning an empty list keeps things simple for beginners.
        return []


def save_tasks(tasks):
    """
    Save the current task list to tasks.json.

    Args:
        tasks (list[dict]): The tasks to save.
    """
    with open(TASK_FILE, "w", encoding="utf-8") as file:
        # indent=2 makes the file easier to read for humans.
        json.dump(tasks, file, indent=2)


def show_tasks(tasks):
    """
    Print all tasks to the screen in a friendly format.
    """
    print("\n--- Your Tasks ---")

    if not tasks:
        print("No tasks yet. Add one from the menu!")
        return

    # enumerate(..., start=1) lets us number tasks beginning at 1.
    for number, task in enumerate(tasks, start=1):
        # If done is True, show a check mark. If False, show an empty box.
        status = "✓" if task["done"] else " "
        print(f"{number}. [{status}] {task['title']}")


def add_task(tasks):
    """
    Ask the user for a task title and add it to the list.
    """
    title = input("Enter a new task: ").strip()

    if title == "":
        print("Task was empty, so nothing was added.")
        return

    # Each task is stored as a dictionary with two keys:
    # - title: the task text
    # - done: whether the task is completed
    tasks.append({"title": title, "done": False})
    save_tasks(tasks)
    print("Task added!")


def complete_task(tasks):
    """
    Mark one task as completed.
    """
    if not tasks:
        print("There are no tasks to complete yet.")
        return

    show_tasks(tasks)
    raw_value = input("Enter task number to mark done: ").strip()

    if not raw_value.isdigit():
        print("Please enter a valid number.")
        return

    task_number = int(raw_value)

    if task_number < 1 or task_number > len(tasks):
        print("That task number does not exist.")
        return

    # Convert user-friendly number (1,2,3) to list index (0,1,2).
    tasks[task_number - 1]["done"] = True
    save_tasks(tasks)
    print("Task marked as done!")


def delete_task(tasks):
    """
    Remove one task from the list.
    """
    if not tasks:
        print("There are no tasks to delete yet.")
        return

    show_tasks(tasks)
    raw_value = input("Enter task number to delete: ").strip()

    if not raw_value.isdigit():
        print("Please enter a valid number.")
        return

    task_number = int(raw_value)

    if task_number < 1 or task_number > len(tasks):
        print("That task number does not exist.")
        return

    removed = tasks.pop(task_number - 1)
    save_tasks(tasks)
    print(f"Deleted task: {removed['title']}")


def main():
    """
    Main loop of the program.

    It keeps showing a menu until the user chooses to quit.
    """
    tasks = load_tasks()

    while True:
        print("\nSimple Task Manager")
        print("1) Show tasks")
        print("2) Add task")
        print("3) Mark task as done")
        print("4) Delete task")
        print("5) Quit")

        choice = input("Choose an option (1-5): ").strip()

        if choice == "1":
            show_tasks(tasks)
        elif choice == "2":
            add_task(tasks)
        elif choice == "3":
            complete_task(tasks)
        elif choice == "4":
            delete_task(tasks)
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid option. Please choose 1, 2, 3, 4, or 5.")


# This line means: run main() only when this file is started directly.
# It does NOT run main() if this file is imported by another Python file.
if __name__ == "__main__":
    main()
