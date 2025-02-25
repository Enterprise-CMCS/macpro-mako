module Jekyll
  module KeyFilter
    def key_list(input)
      return if input.nil?
      keys = []
      input.each_key do |key|
        keys.push(key)
      end
      keys
    end
  end
end

Liquid::Template.register_filter(Jekyll::KeyFilter)
