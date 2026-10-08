import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router';
import api from '../lib/axios';
import { ArrowLeftIcon, ArrowLeftRight, LoaderIcon, Trash2Icon } from 'lucide-react';

const NoteDetailPage = () => {

  const [note, setNote] = useState(null);
  const [originalNote, setOriginalNote] = useState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const { _id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${_id}`);
        setNote(res.data);
        setOriginalNote(res.data);
        // console.log(res.data)
      } catch (error) {
        console.error("Error fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [_id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure want to delete this note?")) return;

    try {
      const deleted = await api.delete(`/notes/${_id}`);
      if (deleted) {
        toast.success("Note deleted");
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting the note", error);
      toast.error("Failed to delete note");
    }
  };
  const handleSave = async () => {
    if (!saving){

    }

    if(!note.title.trim() || !note.content.trim()){
      toast.error("Title or Content cannot be empty");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/notes/${_id}`,
        {title: note.title,
        content: note.content}
      );
      toast.success("Note updated successfully");
      navigate('/');
    } catch (error) {
      console.error("Error saving the note", error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-base-200 flex items-center justify-center'>
        <LoaderIcon className='animate-spin size-10' />
      </div>
    )
  }

  if (!note) {
    return (
      <div className='min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4'>
        <p className='text-lg text-error font-semibold'>Note not found or server error occurred.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeftIcon className='h-5 w-5' />
          Back to Notes
        </Link>
      </div>
    );
  }

  const hasChanged = note.title !== originalNote.title || note.content !== originalNote.content;

  return (
    <div className='min-h-screen bg-base-200'>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className='h-5 w-5' />
              Back to Notes
            </Link>
            <button onClick={handleDelete} className='btn btn-error btn-outline'>
              <Trash2Icon className='h-5 w-5' />
              Delete Note
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className='label'>
                  <span className='label-text'>Title</span>
                </label>
                <input type="text" placeholder='Note Title' className='input input-bordered' value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />
              </div>

              <div className="form-control mb-4">
                <label className='label'>
                  <span className='label-text'>Content</span>
                </label>
                <textarea placeholder='Write your note here...' className='textarea textarea-bordered h-32' value={note.content} onChange={(e) => setNote({ ...note, content: e.target.value })} />
              </div>

              <div className="card-actions justify-end">
                <button className='btn btn-primary' disabled={saving || !hasChanged} onClick={handleSave}>
                  {saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteDetailPage;