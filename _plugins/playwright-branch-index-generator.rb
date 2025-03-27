module Jekyll
  class BranchIndex < Page
    def initialize(site, base, dir, branch)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      process(@name)

      @data = {
        'layout' => 'playwright-branch',
        'title' => branch,
        'branch' => branch
      }

    end
  end

  class BranchIndexGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'playwright-branch'
        dir = "/playwright-reports/branches"
        site.data["playwright-reports"]["branches"].each_key do |branch|
          Jekyll.logger.info "Branch Index: Generating index for #{branch}"
          site.pages << BranchIndex.new(site, site.source, File.join(dir, branch), branch)
        end
      end
    end
  end
end
