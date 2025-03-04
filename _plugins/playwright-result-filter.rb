module Jekyll
  module PlaywrightResultFilter
    def normalize_playwright(input)
      status = playwright_status(input)
      total = playwright_total(input)
      stats = input["stats"]
      stats["errors"] = input["errors"]
      stats["total"] = total
      stats["status"] = status
      stats
    end

    def playwright_total(input)
      if input["errors"].size > 0
        0
      else
        input["stats"]["expected"] + input["stats"]["unexpected"] + input["stats"]["skipped"] + input["stats"]["flaky"]
      end
    end

    def playwright_status(input)
      if input["stats"]["unexpected"] > 0
        # if the unexpected results is greater than one, return fail
        "fail"
      elsif input["errors"].size == 0
        # if there are no unexpected results and no errors, return pass
        "pass"
      else
        # otherwise if there are errors, return error
        "warn"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::PlaywrightResultFilter)
