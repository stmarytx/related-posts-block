const { MenuGroup, MenuItem, SelectControl } = wp.components;
const { Component } = wp.element;
 
export class SearchPostsControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultObjects: [],
            resultButtons: []
        };
        this.buildResultButtons = this.buildResultButtons.bind(this);
        this.changePostType = this.changePostType.bind(this);
        this.getStartingData = this.getStartingData.bind(this);
        this.updateSelectedIds = this.updateSelectedIds.bind(this);
        this.searchFor = this.searchFor.bind(this);
    }
 
    componentDidMount() {
        this.getStartingData();
    }
 
    buildResultButtons() {
        let { setAttributes } = this.props;
        let resultButtons = this.state.resultObjects.map(function(item, ind) {
            let isChecked = false;
            // Save the opposite value for onClick
            // Must have default true, because if nothing is selected, it's false, and true is what it should change to
            let toCheck = true;
            if(isChecked == true) {
                toCheck = false;
            }
            return(
                <MenuItem id={ item.id } data-ischecked={ isChecked } onClick={ () => this.updateSelectedIds(parseInt(event.target.id), toCheck) }
                >
                    { item.title.rendered }
                </MenuItem>
            );
        }, this);
        // Save timestamp in milliseconds - this forces the setAttributes call for postIds to work
        let timeNow = Date.now();
        this.setState({ resultButtons: resultButtons }, setAttributes({ updated: timeNow }));
    }
 
    changePostType(newType) {
        // Clear postIds, update postType Attribute
        let { setAttributes } = this.props;
        setAttributes({ postType: newType });
        // Clear state and run a new search
        this.setState({ resultObjects: [], resultButtons: []}, this.searchFor(newType));
    }
 
    getStartingData() {
        this.searchFor('');
    }
 
    searchFor(searchPostType = '') {
        let { attributes: { postType } } = this.props;
        let finalPostType = postType;
        // If a post type was explicitly passed to the function, use that instead
        if(searchPostType != '') {
            finalPostType = searchPostType;
        }
        // Make REST API call to get post objects - excluding current ID, but including the postType and keyword if present
        let currentId = wp.data.select('core/editor').getCurrentPostId();
        let path = '/wp/v2/' + finalPostType + '?exclude=' + currentId;
        wp.apiFetch( { path: path } ).then( ( posts ) => {
            this.setState({ resultObjects: posts }, () => this.buildResultButtons());
        })
        .catch( (error) => {
            // Show errors in the console
            console.log('There was an error in the Related Posts block while searching for posts.',error);
        })
    }
 
    updateSelectedIds(id, val) {
        console.log(id + ' checked is ' + val);
    }
 
    render() {
        let { attributes: { postType } } = this.props;
        return(
            <div className='search-posts-control'>
                <div className='posts-selected'>
                    <h2>Currently selected:</h2>
                    <SelectControl
                        label='Post Type'
                        value={ postType }
                        options={ [
                            { label: 'Post', value: 'posts' },
                            { label: 'Page', value: 'pages' },
                        ] }
                        onChange={ (val) => { this.changePostType(val) } }
                    />
                </div>
                <div className='posts-search'>
                    <h2>Add to selections:</h2>
                    <MenuGroup label='Search Results' className='posts-list' >
                        { this.state.resultButtons }
                    </MenuGroup>
                </div>
            </div>
        );
    }
}