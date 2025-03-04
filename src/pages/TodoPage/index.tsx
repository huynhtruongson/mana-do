import {TodoItem, TodoToolbar} from 'components';
import {EnhanceTodoStatus, TodoStatus} from 'models/todo';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import Service from 'service';
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  setError,
  setTodos,
  toggleAllTodos,
  updateTodoContent,
  updateTodoStatus,
} from 'store/actions';
import reducer, {initialState} from 'store/reducer';
import {isTodoCompleted} from 'utils';
import './TodoPage.css';
const ToDoPage = () => {
  const [{todos}, dispatch] = useReducer(reducer, initialState);
  const [showing, setShowing] = useState<EnhanceTodoStatus>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);
  const storageRef = useRef(false);
  const [editing, setEditing] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await Service.getTodos();
        dispatch(setTodos(resp || []));
        storageRef.current = true;
      } catch (error) {
        // handle error
        dispatch(setError());
      }
    })();
  }, []);

  // using useEffect to watch todo list changed, then save it to local storage.
  useEffect(() => {
    (() => {
      // make sure this call back is always called after fetching data in first useEffect.
      if (storageRef.current) localStorage.setItem('todos', JSON.stringify(todos));
    })();
  }, [todos]);

  const onCreateTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    try {
      // check the property value of inputRef is not empty
      if (e.key === 'Enter' && inputRef.current?.value) {
        const resp = await Service.createTodo(inputRef.current.value.trim());
        dispatch(createTodo(resp));
        inputRef.current.value = '';
      }
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };

  const onUpdateTodoStatus = async (todoId: string, value: boolean) => {
    try {
      const resp = await Service.updateTodoStatus(todoId, value);
      if (resp) dispatch(updateTodoStatus(todoId, value));
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };

  const onToggleAllTodo = async (value: boolean) => {
    try {
      const resp = await Service.toggleAllTodo(value);
      if (resp) dispatch(toggleAllTodos(value));
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };

  const onDeleteAllTodo = async () => {
    try {
      const resp = await Service.deleteAllTodo();
      if (resp) dispatch(deleteAllTodos());
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };

  const onDeleteTodo = async (todoID: string) => {
    try {
      const resp = await Service.deleteTodo(todoID);
      if (resp) dispatch(deleteTodo(todoID));
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };
  const onUpdateTodoContent = async (todoID: string, value: string) => {
    try {
      const resp = await Service.updateTodoContent(todoID, value);
      if (resp) dispatch(updateTodoContent(todoID, value));
    } catch (error) {
      // handle error
      dispatch(setError());
    }
  };
  const onSetShowing = (option: EnhanceTodoStatus) => {
    setShowing(option);
  };
  const onTodoDoubleClick = (editID: string) => {
    setEditing(editID);
  };
  const onToggleEditTodo = () => {
    if (editing) setEditing('');
  };
  const showTodos = todos.filter((todo) => {
    switch (showing) {
      case TodoStatus.ACTIVE:
        return todo.status === TodoStatus.ACTIVE;
      case TodoStatus.COMPLETED:
        return todo.status === TodoStatus.COMPLETED;
      default:
        return true;
    }
  });
  const activeTodos = todos.reduce(function (accum, todo) {
    return isTodoCompleted(todo) ? accum : accum + 1;
  }, 0);
  return (
    <div className='ToDo__container'>
      <div className='Todo__creation'>
        <input
          ref={inputRef}
          className='Todo__input'
          placeholder='What need to be done?'
          onKeyDown={onCreateTodo}
        />
      </div>
      <div className='ToDo__list'>
        {showTodos.map((todo) => {
          return (
            <TodoItem
              key={todo.id}
              editing={editing}
              todo={todo}
              onUpdateTodoStatus={onUpdateTodoStatus}
              onDeleteTodo={onDeleteTodo}
              onTodoDoubleClick={onTodoDoubleClick}
              onToggleEditTodo={onToggleEditTodo}
              onUpdateTodoContent={onUpdateTodoContent}
            />
          );
        })}
      </div>
      <TodoToolbar
        todoAmount={todos.length}
        activeTodos={activeTodos}
        showing={showing}
        onToggleAllTodo={onToggleAllTodo}
        onDeleteAllTodo={onDeleteAllTodo}
        onSetShowing={onSetShowing}
      />
    </div>
  );
};

export default ToDoPage;
