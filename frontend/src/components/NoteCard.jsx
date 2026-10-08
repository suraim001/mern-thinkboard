import { Link } from "react-router";
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { formatDate } from "../lib/utils.js";
import api from "../lib/axios.js";
import toast from "react-hot-toast";

const NoteCard = ({note, setNotes}) => {

  const handleDelete = async (e,_id)=> {
    e.preventDefault();
    if(!window.confirm("Are you want to delete the note?")) return;

    try {
      await api.delete(`/notes/${_id}`);
      setNotes((prev)=> prev.filter((note)=> note._id !== _id))
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error in handleDelete function", error);
      toast.error("Failed to delete the note");
    }
  };

  return (
    <Link to={`/note/${note._id}`}
    className="card bg-base-100 hover:shadow-lg hover:shadow-slate-700 transition-all duration-200 border-t-4 border-solid border-[#00ff9d]">
        <div className="card-body">
            <h3 className="card-title text-base-content">{note.title}</h3>
            <p className="text-base-content/70 line-clamp-3">{note.content}</p>
            <div className="card-actions justify-between items-center mt-4">
              <span className="text-sm text-base-content/60">{formatDate(new Date(note.createdAt))}</span>
              <div className="flex items-center gap-1">
                <PenSquareIcon className="size-4" />
                <button className="btn btn-ghost btn-xs text-error" onClick={(e) => handleDelete(e, note._id)}>
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            </div>
        </div>
    </Link>
  )
}

export default NoteCard