import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, path, bgColor, icon }) => {
  return (
    <Link to={path}>
      <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`${bgColor} p-6`}>
          <div className="mb-4">{icon}</div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/80">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard; 