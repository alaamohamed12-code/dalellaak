import { useLang } from './Providers';
import { getProfileImageUrl } from '../../lib/image-utils';

export default function UserMenu({ user, onLogout }: { user: { username: string; image?: string }, onLogout: () => void }) {
  const { t } = useLang();
  const defaultAvatar = '/profile-images/default-avatar.svg';
  const imageSrc = getProfileImageUrl(user.image);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {imageSrc !== defaultAvatar ? (
          <img src={imageSrc} alt={user.username} className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
        ) : (
          <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-lg border-2 border-cyan-500">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
          </div>
        )}
        <span className="font-semibold text-cyan-800">{user.username}</span>
      </div>
      {/* Actions moved to Header right side */}
    </div>
  );
}
