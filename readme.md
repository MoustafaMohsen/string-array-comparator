
  

# String array Comparator

String array Comparator is a TypeScript Node.js module and npm package ([Package page](https://www.npmjs.com/package/string-array-comparator)) to compare an arrays of string against another (e.g. books Edition 1 and Edition 2), and return the matching results of each element.

  

**Features:**

- compare each element of the master array to a slave array and save the matching result if general similarities reached a custom threshold

- Similarities are determined by the **percentage** of words found in both strings being compared, and the **skewness** of similarities of words in the slave string

- Custom index, Range index and Dynamic index that could be helpful if the two array are very large and the similarities are between the two are usually close in order, like different versions/prints of the same book.

- Range index to set the max and minimum index to search in the slave index relative to the current master index

- Dynamic range that changes the relative index based on similarities found in previous matches

- Ignore custom words and not match it in the search results

  

[Project page](https://github.com/MoustafaMohsen/string-array-comparator)

  
  

## Contributing

  

1. Fork it!

2. Create your feature branch: `git checkout -b my-new-feature`

3. Commit your changes: `git commit -am 'Add some feature'`

4. Push to the branch: `git push origin my-new-feature`

5. Submit a pull request :D

  

Please read [CONTRIBUTING.md](https://github.com/MoustafaMohsen/string-array-comparator/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

  

## Versioning

  

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

  

## Authors

  

*  **Moustafa Mohsen** - *Creator* - [moustafamohsen.com](moustafamohsen.com)

  
  

## License

  

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details