module Jekyll
  module CoverageResultFilter
    def coverage_status(input, name)
      if input >= @context.registers[:site].data["coverage"]["thresholds"]["pass"][name]
        "pass"
      elsif input >= @context.registers[:site].data["coverage"]["thresholds"]["fail"][name]
        "warn"
      else
        "fail"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::CoverageResultFilter)
