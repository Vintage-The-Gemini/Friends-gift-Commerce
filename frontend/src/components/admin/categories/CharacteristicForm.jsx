// src/components/admin/categories/CharacteristicForm.jsx
import { Trash2, X, Plus } from "lucide-react";

const CharacteristicForm = ({ 
  characteristics = [], 
  onUpdate, 
  onRemove, 
  onAddOption,
  onUpdateOption,
  onRemoveOption
}) => {

  if (characteristics.length === 0) {
    return <p className="text-sm text-gray-500 italic">No characteristics defined</p>;
  }

  return (
    <div className="space-y-4">
      {characteristics.map((char, index) => (
        <div key={index} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between mb-2">
            <h4 className="text-sm font-medium">Characteristic #{index+1}</h4>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label="Remove characteristic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={char.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={char.type}
                onChange={(e) => onUpdate(index, 'type', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select (Single)</option>
                <option value="multiselect">Select (Multiple)</option>
                <option value="color">Color</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`required-${index}`}
              checked={char.required}
              onChange={(e) => onUpdate(index, 'required', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`required-${index}`}
              className="ml-2 block text-xs text-gray-700"
            >
              Required Field
            </label>
          </div>
          
          {/* Options for select types */}
          {(char.type === 'select' || char.type === 'multiselect') && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-700">
                  Options
                </label>
                <button
                  type="button"
                  onClick={() => onAddOption(index)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Add Option
                </button>
              </div>
              
              {char.options && char.options.length > 0 ? (
                <div className="space-y-2">
                  {char.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => onUpdateOption(index, optionIndex, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${optionIndex+1}`}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveOption(index, optionIndex)}
                        className="ml-2 text-red-600 hover:text-red-800 p-1"
                        aria-label="Remove option"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No options defined</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CharacteristicForm;