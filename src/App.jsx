import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 1. READ: Fetch tasks from the cloud
  const fetchTasks = () => {
    fetch('https://task-api-xo97.onrender.com/tasks')
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("API Error:", error));
  };

  // Run fetchTasks once when the page loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. CREATE: Send a new task to the cloud
  const handleCreateTask = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    fetch('https://task-api-xo97.onrender.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle })
    })
    .then(() => {
      setNewTaskTitle(''); // Clear the input box
      fetchTasks(); // Fetch the updated list from the database
    });
  };

  // 3. DELETE: Tell the cloud to delete a task by ID
  const handleDeleteTask = (taskId) => {
    fetch(`https://task-api-xo97.onrender.com/tasks/${taskId}`, {
      method: 'DELETE'
    })
    .then(() => {
      fetchTasks(); // Fetch the updated list from the database
    });
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '400px' }}>
      <h1>My Cloud Tasks ☁️</h1>
      
      {/* The Form for Creating Tasks */}
      <form onSubmit={handleCreateTask} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={newTaskTitle} 
          onChange={(e) => setNewTaskTitle(e.target.value)} 
          placeholder="What needs to be done?"
          required
          style={{ padding: '8px', width: '70%' }}
        />
        <button type="submit" style={{ padding: '8px', width: '25%', marginLeft: '5%' }}>
          Add
        </button>
      </form>

      {/* The List for Displaying and Deleting Tasks */}
      {tasks.length === 0 ? (
        <p>No tasks found...</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task._id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
              {task.title}
              <button onClick={() => handleDeleteTask(task._id)} style={{ color: 'red', cursor: 'pointer' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;