import axios from 'axios';

async function deleteHandler(id: string) {
  try {
    const response = await axios.delete(`/presets/delete-preset/${id}`, {
      params: { id },
    });
  } catch (error) {
    console.log('Error', error);
  }
}

export { deleteHandler };
