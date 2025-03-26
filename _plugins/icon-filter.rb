module Jekyll
  module IconFilter
    def status_icon(input)
      case input
      when "pass"
        "<svg aria-hidden='true' fill='currentColor' height='100%' width='100%' viewBox='0 0 16 16' version='1.1'>
	        <path fillRule='evenodd' d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'></path>
        </svg>"
      when "fail"
        "<svg aria-hidden='true' fill='currentColor' height='100%' width='100%' viewBox='0 0 16 16' version='1.1'>
          <path fillRule='evenodd' d='M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z'></path>
        </svg>"
      when "warn"
        "<svg aria-hidden='true' fill='currentColor' height='100%' width='100%' viewBox='0 0 16 16' version='1.1'>
          <path fillRule='evenodd' d='M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z'></path>
        </svg>"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::IconFilter)
