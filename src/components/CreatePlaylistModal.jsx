import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { toast } from 'react-hot-toast';
import { createPlaylist } from '@/services/playlistApi';
import { useDispatch } from 'react-redux';
import { setIsTyping } from '@/redux/features/loadingBarSlice';

const CreatePlaylistModal = ({ show, setShow, setPlaylists }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

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
                if(setPlaylists) {
                  setPlaylists(prev => [...prev, res.data.playlist])
                }
                setShow(false)
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
    
    return (show &&
        <div className='fixed top-0 left-0 w-full h-full z-[60] flex justify-center items-center'>
            <div onClick={() => setShow(false)} className='fixed bg-black bg-opacity-50 top-0 left-0 w-full h-full z-[55]'></div>
                <div onClick={(e) => e.stopPropagation() } className='bg-[#020813] border border-gray-700 bg-opacity-95 backdrop-blur-sm rounded-lg w-[90%] md:w-[500px] z-[60] p-4 text-white'>
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-xl font-bold'>Create Playlist</h1>
                        <button onClick={() => setShow(false)} className='text-gray-400 hover:text-white text-xl font-bold'>X</button>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-6'>
                        <div className="w-full">
                            <input 
                              onFocus={handleFocus} 
                              onBlur={handleBlur} 
                              onChange={handleChange} 
                              value={name} 
                              name='name' 
                              type="text" 
                              placeholder="My Playlist #1" 
                              required 
                              className='w-full bg-gray-800 rounded p-3 text-white border border-gray-600 focus:border-[#00e6e6] focus:outline-none transition-colors' 
                            />
                        </div>
                            <button 
                              onClick={handelCreate} 
                              disabled={loading}
                              className='w-full bg-[#00e6e6] hover:bg-[#00c4c4] text-black font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors'
                            >
                                {
                                    loading ? <div className='custom-loader w-[20px] h-[20px]'></div> : <FaPlus />
                                }
                                Create Playlist
                            </button>
                    </div>
                </div>
        </div>
    )
}

export default CreatePlaylistModal

