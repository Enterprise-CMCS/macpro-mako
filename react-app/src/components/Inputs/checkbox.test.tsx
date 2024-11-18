import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from './checkbox';
import React from 'react';

describe('Checkbox Component', () => {
  it('renders correctly with a label', () => {
    render(<Checkbox label="Accept Terms" />);
    expect(screen.getByLabelText('Accept Terms')).toBeInTheDocument();
  });

  it('renders correctly with a styledLabel', () => {
    render(<Checkbox styledLabel={<span>Styled Label</span>} />);
    expect(screen.getByText('Styled Label')).toBeInTheDocument();
  });

  it('displays description if provided', () => {
    render(<Checkbox label="Terms" description="Please accept terms and conditions" />);
    expect(screen.getByText('Please accept terms and conditions')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(<Checkbox label="Terms" className="custom-class" />);
    const checkbox = screen.getByLabelText('Terms');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('toggles checked state when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Terms" onCheckedChange={handleChange} />);
    const checkbox = screen.getByLabelText('Terms');

    // Simulate checking the checkbox
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);

    // Simulate unchecking the checkbox
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});

describe('CheckboxGroup Component', () => {
  it('renders all options correctly', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];
    render(<CheckboxGroup value={[]} onChange={() => {}} options={options} />);

    options.forEach((opt) => {
      expect(screen.getByLabelText(opt.label)).toBeInTheDocument();
    });
  });

  it('checks the correct checkboxes based on initial value', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];
    render(<CheckboxGroup value={['opt1']} onChange={() => {}} options={options} />);

    expect(screen.getByLabelText('Option 1')).toBeChecked();
    expect(screen.getByLabelText('Option 2')).not.toBeChecked();
  });

  it('calls onChange with the correct values when a checkbox is toggled', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];
    const handleChange = vi.fn();
  
    // State wrapper for CheckboxGroup to handle the "value" prop directly
    const CheckboxGroupWrapper = () => {
        const [value, setValue] = React.useState<string[]>([]);
        return (
          <CheckboxGroup
            value={value}
            onChange={(newValue) => {
              setValue(newValue); // Update internal state
              handleChange(newValue); // Call the spy
            }}
            options={options}
          />
        );
      };
  
      // Render the wrapper component
      render(<CheckboxGroupWrapper />);
  
      // 1. Check "Option 1"
      fireEvent.click(screen.getByLabelText('Option 1'));
      expect(handleChange).toHaveBeenNthCalledWith(1, ['opt1']);
  
      // 2. Log output and then Check "Option 2"
      fireEvent.click(screen.getByLabelText('Option 2'));
      expect(handleChange).toHaveBeenNthCalledWith(2, ['opt1', 'opt2']);  // Expect both checked
  
      // 3. Uncheck "Option 1"
      fireEvent.click(screen.getByLabelText('Option 1'));
      expect(handleChange).toHaveBeenNthCalledWith(3, ['opt2']);
    });
});
