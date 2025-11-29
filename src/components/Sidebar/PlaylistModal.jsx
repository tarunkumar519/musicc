import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { createPlaylist } from '@/services/playlistApi';
import { useDispatch } from 'react-redux';
import { setIsTyping } from '@/redux/features/loadingBarSlice';

const PlaylistModal = ({ show, setShow, onSuccess }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleChange = (e) => {
        setName(e.target.value)
    }
    
    const handelCreate = async () => {
        console.log(name)
        if(name === ''){
            toast.error('Playlist name is required')
        }
        else{
            setLoading(true)
            const res = await createPlaylist(name);
            if(res.success == true){
                toast.success(res.message)
                setName('')
                setShow(false)
                if (onSuccess) onSuccess();
            }
            else{
                toast.error(res.message)
            }
            setLoading(false)
        }
    }

    // handle focus
    const handleFocus = () => {
        dispatch(setIsTyping(true));
      };
      const handleBlur = () => {
        dispatch(setIsTyping(false));
      };
    
    if (!show || !mounted) return null;

    return createPortal(
        <div>
            <div onClick={() => setShow(false)} className='fixed bg-black bg-opacity-50 top-0 left-0 w-full h-full z-[9999] flex justify-center items-center text-white'>
                <div onClick={(e) => e.stopPropagation() } className='bg-black border border-gray-700 bg-opacity-90 backdrop-blur-md rounded-lg w-[500px] shadow-2xl'>
                    <div className='flex justify-between items-center px-4 py-2 border-b border-gray-700'>
                        <h1 className='text-lg font-semibold'>Create Playlist</h1>
                        <button onClick={() => setShow(false)} className='text-white text-lg font-semibold hover:text-gray-300'>X</button>
                    </div>
                    <div className='flex flex-col justify-center items-center p-6'>
                        <div className=" flex gap-4 items-end mb-6 w-full justify-center">
                            <label className="text-lg font-medium" htmlFor='name'>Name</label>
                            <input 
                                onFocus={handleFocus} 
                                onBlur={handleBlur} 
                                onChange={handleChange} 
                                value={name} 
                                name='name' 
                                type="text" 
                                placeholder="My Awesome Playlist" 
                                required 
                                className='bg-transparent border-b border-gray-500 focus:border-[#00e6e6] focus:outline-none text-lg py-1 w-2/3 transition-colors' 
                            />
                        </div>
                            <button onClick={handelCreate} className='text-sm font-bold flex gap-2 bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 items-center transition-transform hover:scale-105'>
                                {
                                    loading ? <div className='custom-loader w-[20px] h-[20px] border-black'></div> : <FaPlus />
                                }
                                Create
                            </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default PlaylistModal
