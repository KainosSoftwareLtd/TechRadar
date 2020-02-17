$(function() {
    window.TechRadar = window.TechRadar || {};

    /**
     * Make a call to get all tags 
     */
    TechRadar.getAllTags = function (done) {
        $.ajax({
            type: "GET",
            url: '/api/tags',
            contentType: "application/json",
            success: function(result) {
                if(result.success) {
                    done(result.result); // get the nested results
                } else {
                    console.log('Error getting tags.');
                    done(null, new Error('Error getting tags'));
                }
            }
        });
    };

    /**
     * Return a string (HTML) that represents a tag as a <span> element with an anchor
     * @param tag Contains id and name of a tag
     */
    TechRadar.convertTagToHtml = function(tag) {
        return '<a href="/projects/tags/' +
            tag.id + '"><span class="tag label label-info">' + 
            tag.name + '</span></a> ';
    };

    /**
     * Provide a function used by bootstrap-table to format/display tags in cells
     * @param allTags array of tag objects containing id and name properties
     */
    TechRadar.getTagsFormatter = function(allTags) {
        return function(value, row, index) {
            var tagsAsHtml = '';
            var tagIdsString = row.tags;

            if(tagIdsString) {
                var tagIds = tagIdsString.split(','); // array of tag IDs

                tagIds.forEach(function(tagId) { 
                    var tag = allTags.find(function(element) {
                        return element.id == tagId;
                    });
                    tagsAsHtml += TechRadar.convertTagToHtml(tag);
                });
            }

            return tagsAsHtml;
        };
    };
});
