import React, { useState, useEffect } from 'react';
// https://github.com/clauderic/react-sortable-hoc
import {SortableContainer, SortableElement, sortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import './App.scss';


function TodoForm() {
  //////////////////////
  // Constants and State
  //////////////////////

  // Get list data from local storage and validate it
  let todoListLocalStorage = window.localStorage.getItem("todoList");
  if(todoListLocalStorage) {
    try {
      todoListLocalStorage = JSON.parse(todoListLocalStorage);
    } catch(e) {
      todoListLocalStorage = [];
    }
  }

  // Initialize constants
  const todoListInitial = () => todoListLocalStorage || [];
  const [todoList, updateToDoList] = useState(todoListInitial);
  const [formErrors, updateErrors] = useState({
    hasErrors: false,
    errorMessage: ""
  });
  const [inputTodoValue, updateInputTodoValue] = useState("");
  const maxInputLength = 100;
  const [inputTodoValueLength, updateInputTodoValueLength] = useState(maxInputLength);

  // Update local storage with the latest todoList
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }, [todoList]);

  ///////////
  // Handlers
  ///////////
  const updateToDoListHandler = (e) => {
    e.preventDefault();

    // Empty TODO
    if(inputTodoValue === "") {
      // Show error
      updateErrors(formErrors => {
        return {
          ...formErrors,
          hasErrors: true,
          errorMessage: "Please enter your to-do."
        }
      });
    }
    // Valid TODO
    else {
      // Reset errors
      updateErrors({
        ...formErrors,
        hasErrors: false,
        errorMessage: ""
      });
      // Reset input value
      updateInputTodoValue("");
      // Reset input length
      updateInputTodoValueLength(maxInputLength);
      // Add TODO to the TODO list
      updateToDoList([
        {
          id: Date.now() + (Math.random() * 1000000),
          title: inputTodoValue
        },
        ...todoList
      ]);
    }
  }

  // On input change event
  const updateInputTodoValueHandler = (e) => {
    const remainingLength = maxInputLength - e.target.value.length;
    const limitedInput = e.target.value.slice(0, maxInputLength);

    // Update input value with the limited length input
    updateInputTodoValue(limitedInput);
    // Update the current length of the input
    updateInputTodoValueLength(maxInputLength - limitedInput.length)

    // We have reached the max input length, show error
    if(remainingLength < 0) {
      updateErrors({
        ...formErrors,
        hasErrors: true,
        errorMessage: "Input limit is 100 characters."
      });
    }
    // Reset errors
    else {
      updateErrors({
        ...formErrors,
        hasErrors: false,
        errorMessage: ""
      });
    }
  }

  // Remove TODO from the list by id
  const removeToDoHandler = id => {
    const data = todoList.filter(i => i.id !== id)
    updateToDoList(data);

  }

  // User has dragged the item, update the TODO list
  const onSortEnd = ({oldIndex, newIndex}) => {
    const newTodoList = todoList;
    const movedTodoList = arrayMove(newTodoList, oldIndex, newIndex);
    updateToDoList(movedTodoList);
  };

  // Delete the TODO list
  const deleteAllTodods = () => {
    updateToDoList([]);
  }

  ///////////
  // Elements
  ///////////

  // Output for the drag handle
  const DragHandle = sortableHandle(({index}) => {
    return(
      <span className="list-order-number">{ index + 1 }</span>
    )
  });

  // Single sortable item (<li></li>) that contains the DragHandle element
  const SortableItem = SortableElement(({item, index}) => {
    return (
      <li className="g-sortable-item" key={item.id}>
        <DragHandle index={index}/>
        {item.title}
        <button
          className="remove-todo"
          onClick={() => removeToDoHandler(item.id)}><i className="fa fa-trash" aria-hidden="true"></i>
        </button>
      </li>
    )
  });

  // Display the todoList in <ul></ul> with the SortableItem for each item
  const TodoListOutput = () => {
    if(todoList.length) {
      return (
        <ul className="todo-list">
          {todoList.map((item, index) => (
            <SortableItem key={item.id} index={index} item={item}/>
          ))}
        </ul>
      )
    }
    else {
      return (
        <div className="no-todos">You did everything you had to, great job!</div>
      )
    }
  }

  // Wrap entire list output inside SortableList (SortableContainer)
  const SortableList = SortableContainer(({todoList}) => {
    return (
      <TodoListOutput item={todoList}/>
    );
  });

  // Wrap SortableList inside SortableComponent ()
  const SortableComponent = ({todoList, onSortEnd}) => {
    return (
      <SortableList items={todoList} onSortEnd={onSortEnd} helperClass="moving-item" useDragHandle/>
    )
  }

  // Form errors output
  const FormErrors = ({formErrors}) => {
    if(formErrors.hasErrors) {
      return (
        <div className="form-error">{formErrors.errorMessage}</div>
      )
    }
    else {
      return "";
    }
  }

  // Delete all todos button
  const DeleteAllTodos = ({todoList}) => {
    if(todoList.length) {
      return(
        <button onClick={deleteAllTodods}>Delete all todos</button>
      )
    }
    else {
      return "";
    }
  }

  // Final output
  return(
    <React.Fragment>
      <form
        className="todo-form h-clearfix"
        onSubmit={updateToDoListHandler} >
        <input
          id="title"
          type="text"
          onChange={updateInputTodoValueHandler}
          value={inputTodoValue}
          placeholder="What do you need to do?" />
        <button>Add</button>
      </form>
      <div>{ inputTodoValueLength } characters left.</div>
      <FormErrors formErrors={formErrors} />
      <SortableComponent items={todoList} onSortEnd={onSortEnd} />
      <DeleteAllTodos todoList={todoList} />
    </React.Fragment>
  )
}

function App() {
  return(
    <div className="c-todo-form-wrap">
      <TodoForm />
    </div>
  )
}

export default App;
